import { createClient, SupabaseClient } from "@supabase/supabase-js";
import crypto from "crypto";
import ws from "ws";

if (typeof globalThis.WebSocket === "undefined") {
  (globalThis as any).WebSocket = ws;
}

// Initialize Supabase Client for Storage operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
  },
});

function getBucketName(): string {
  return process.env.SUPABASE_STORAGE_BUCKET || process.env.S3_BUCKET_NAME || "pdfs";
}

/**
 * Upload public file (e.g. avatars, covers) to Supabase Storage bucket
 * @param file - File buffer to upload
 * @param originalFilename - Original filename (optional, for extension)
 * @returns Public URL of uploaded file
 */
export async function uploadToS3(
  file: Buffer,
  originalFilename?: string
): Promise<string> {
  try {
    const fileExtension = originalFilename
      ? originalFilename.split(".").pop()
      : "jpg";
    const uniqueFilename = `avatars/${crypto.randomUUID()}.${fileExtension}`;
    const bucketName = getBucketName();
    const contentType = fileExtension === "pdf" ? "application/pdf" : `image/${fileExtension}`;

    const { error } = await supabase.storage
      .from(bucketName)
      .upload(uniqueFilename, file, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.error("Error uploading to Supabase Storage:", error);
      throw new Error(`Failed to upload file to Supabase: ${error.message}`);
    }

    const { data } = supabase.storage.from(bucketName).getPublicUrl(uniqueFilename);
    return data.publicUrl;
  } catch (error) {
    console.error("Error uploading to Supabase Storage:", error);
    throw new Error("Failed to upload file to Supabase Storage");
  }
}

/**
 * Upload payment screenshot to Supabase Storage bucket
 * @param file - File buffer
 * @param contentType - Content type of file
 * @returns Storage Key
 */
export async function uploadPaymentScreenshot(
  file: Buffer,
  contentType: string
): Promise<string> {
  const ext = contentType.split("/")[1] || "jpg";
  const uniqueKey = `payment-screenshots/${crypto.randomUUID()}.${ext}`;
  const bucketName = getBucketName();

  const { error } = await supabase.storage
    .from(bucketName)
    .upload(uniqueKey, file, {
      contentType,
      upsert: true,
    });

  if (error) {
    console.error("Error uploading payment screenshot to Supabase Storage:", error);
    throw new Error(`Failed to upload payment screenshot: ${error.message}`);
  }

  return uniqueKey;
}

/**
 * Upload private file to Supabase Storage bucket (for Ebooks)
 * @param file - File buffer
 * @param originalFilename - Original filename
 * @returns Storage Key
 */
export async function uploadPrivateFile(
  file: Buffer,
  originalFilename: string
): Promise<string> {
  const fileExtension = originalFilename.split(".").pop();
  const uniqueKey = `ebooks/${crypto.randomUUID()}.${fileExtension}`;
  const bucketName = getBucketName();

  const { error } = await supabase.storage
    .from(bucketName)
    .upload(uniqueKey, file, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (error) {
    console.error("Error uploading private file to Supabase Storage:", error);
    throw new Error(`Failed to upload private file: ${error.message}`);
  }

  return uniqueKey;
}

/**
 * Generate presigned URL for direct-from-browser upload.
 */
export async function getUploadPresignedUrl(
  key: string,
  contentType: string,
  _expiresIn = 600
): Promise<string> {
  const bucketName = getBucketName();

  const { data, error } = await supabase.storage
    .from(bucketName)
    .createSignedUploadUrl(key);

  if (error || !data) {
    console.error("Error creating signed upload URL:", error);
    throw new Error(`Failed to create signed upload URL: ${error?.message || "Unknown error"}`);
  }

  return data.signedUrl;
}

/**
 * Build public URL for a key in Supabase Storage.
 */
export function getPublicUrlForKey(key: string): string {
  const bucketName = getBucketName();
  const { data } = supabase.storage.from(bucketName).getPublicUrl(key);
  return data.publicUrl;
}

/**
 * Generate signed URL for private file (compatibility wrapper for CloudFront signed URL)
 * @param key - Storage Key
 * @param expiresIn - Expiry in seconds (default 3600 = 1 hour)
 */
export async function getCloudFrontSignedUrl(
  key: string,
  expiresIn = 3600,
  responseContentDisposition?: string
): Promise<string> {
  return getPresignedUrl(key, expiresIn, responseContentDisposition);
}

/**
 * Generate presigned/signed URL for private file download
 * @param key - Storage Key
 * @param expiresIn - Expiry in seconds (default 3600 = 1 hour)
 * @param responseContentDisposition - Optional Content-Disposition header
 * @param responseContentType - Optional Content-Type header
 */
export async function getPresignedUrl(
  key: string,
  expiresIn = 3600,
  responseContentDisposition?: string,
  _responseContentType?: string
): Promise<string> {
  const bucketName = getBucketName();

  let downloadOption: boolean | string | undefined = true;
  if (responseContentDisposition) {
    if (responseContentDisposition.trim().startsWith("inline")) {
      downloadOption = undefined;
    } else {
      const match = responseContentDisposition.match(/filename="([^"]+)"/);
      if (match && match[1]) {
        downloadOption = match[1];
      } else {
        downloadOption = true;
      }
    }
  }

  const tryGetUrl = async (targetKey: string) => {
    return await supabase.storage
      .from(bucketName)
      .createSignedUrl(
        targetKey,
        expiresIn,
        downloadOption !== undefined ? { download: downloadOption } : undefined
      );
  };

  // Primary attempt
  let { data, error } = await tryGetUrl(key);

  // If object not found, attempt fallback key path (e.g. without 'ebooks/' prefix or with 'ebooks/' prefix)
  if (error && (error as any).statusCode === '404') {
    const fallbackKey = key.startsWith("ebooks/")
      ? key.replace(/^ebooks\//, "")
      : `ebooks/${key}`;

    const fallbackResult = await tryGetUrl(fallbackKey);
    if (!fallbackResult.error && fallbackResult.data) {
      data = fallbackResult.data;
      error = null;
    }
  }

  if (error || !data) {
    console.error("Error creating signed download URL from Supabase:", error);
    throw new Error(`Failed to generate presigned URL: ${error?.message || "Unknown error"}`);
  }

  return data.signedUrl;
}

/**
 * Fetch PDF file from Supabase Storage as Buffer (for watermarking / merging)
 * @param key - Storage Key
 * @returns PDF as Buffer
 */
export async function fetchPdfBuffer(key: string): Promise<Buffer> {
  const bucketName = getBucketName();

  let { data, error } = await supabase.storage
    .from(bucketName)
    .download(key);

  // Fallback for key location (root vs ebooks/ folder)
  if (error && (error as any).statusCode === '404') {
    const fallbackKey = key.startsWith("ebooks/")
      ? key.replace(/^ebooks\//, "")
      : `ebooks/${key}`;

    const fallbackResult = await supabase.storage
      .from(bucketName)
      .download(fallbackKey);

    if (!fallbackResult.error && fallbackResult.data) {
      data = fallbackResult.data;
      error = null;
    }
  }

  if (error || !data) {
    console.error("Error downloading file from Supabase Storage:", error);
    throw new Error(`Failed to fetch PDF buffer: ${error?.message || "File not found"}`);
  }

  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}



