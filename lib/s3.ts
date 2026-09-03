import { createClient, SupabaseClient } from "@supabase/supabase-js";
import crypto from "crypto";
import ws from "ws";

if (typeof globalThis.WebSocket === "undefined") {
  (globalThis as any).WebSocket = ws;
}

// Initialize Primary Supabase Client
const primaryUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const primaryKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase: SupabaseClient = createClient(primaryUrl, primaryKey, {
  auth: {
    persistSession: false,
  },
});

// Initialize Fallback Supabase Client (if configured)
const fallbackUrl = process.env.SUPABASE_FALLBACK_URL || "";
const fallbackKey = process.env.SUPABASE_FALLBACK_SERVICE_ROLE_KEY || "";

export const supabaseFallback: SupabaseClient | null =
  fallbackUrl && fallbackKey
    ? createClient(fallbackUrl, fallbackKey, {
        auth: {
          persistSession: false,
        },
      })
    : null;

function getBucketName(): string {
  return process.env.SUPABASE_STORAGE_BUCKET || process.env.S3_BUCKET_NAME || "pdfs";
}

/**
 * Helper to execute storage operations with automatic fallback on quota/service failure
 */
async function withStorageFallback<T>(
  operation: (client: SupabaseClient) => Promise<{ data: T | null; error: any }>,
  actionName: string
): Promise<{ data: T | null; error: any }> {
  const result = await operation(supabase);

  // If operation succeeded, return data
  if (!result.error && result.data) {
    return result;
  }

  // Check if failure is due to quota/service restriction (402, 429, etc.)
  const isServiceError =
    result.error &&
    ((result.error as any).status === 402 ||
      (result.error as any).statusCode === "402" ||
      (result.error as any).status === 429 ||
      (result.error as any).statusCode === "429" ||
      result.error.message?.includes("exceed_egress_quota") ||
      result.error.message?.includes("restricted"));

  if (isServiceError && supabaseFallback) {
    console.warn(`[STORAGE_FALLBACK] Primary Supabase failed for ${actionName} (${result.error?.message}). Falling back to secondary Supabase...`);
    const fallbackResult = await operation(supabaseFallback);
    if (!fallbackResult.error && fallbackResult.data) {
      return fallbackResult;
    }
  }

  return result;
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

    let { error } = await supabase.storage
      .from(bucketName)
      .upload(uniqueFilename, file, {
        contentType,
        upsert: true,
      });

    if (error && supabaseFallback) {
      console.warn("[STORAGE_FALLBACK] Retrying uploadToS3 on fallback Supabase...");
      const fallbackUpload = await supabaseFallback.storage
        .from(bucketName)
        .upload(uniqueFilename, file, {
          contentType,
          upsert: true,
        });
      if (!fallbackUpload.error) {
        error = null;
        const { data } = supabaseFallback.storage.from(bucketName).getPublicUrl(uniqueFilename);
        return data.publicUrl;
      }
    }

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

  let { error } = await supabase.storage
    .from(bucketName)
    .upload(uniqueKey, file, {
      contentType,
      upsert: true,
    });

  if (error && supabaseFallback) {
    console.warn("[STORAGE_FALLBACK] Retrying uploadPaymentScreenshot on fallback Supabase...");
    const fallbackUpload = await supabaseFallback.storage
      .from(bucketName)
      .upload(uniqueKey, file, {
        contentType,
        upsert: true,
      });
    if (!fallbackUpload.error) {
      return uniqueKey;
    }
  }

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

  let { error } = await supabase.storage
    .from(bucketName)
    .upload(uniqueKey, file, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (error && supabaseFallback) {
    console.warn("[STORAGE_FALLBACK] Retrying uploadPrivateFile on fallback Supabase...");
    const fallbackUpload = await supabaseFallback.storage
      .from(bucketName)
      .upload(uniqueKey, file, {
        contentType: "application/pdf",
        upsert: true,
      });
    if (!fallbackUpload.error) {
      return uniqueKey;
    }
  }

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
  _contentType: string,
  _expiresIn = 600
): Promise<string> {
  const bucketName = getBucketName();

  let { data, error } = await supabase.storage
    .from(bucketName)
    .createSignedUploadUrl(key);

  if ((error || !data) && supabaseFallback) {
    console.warn("[STORAGE_FALLBACK] Retrying getUploadPresignedUrl on fallback Supabase...");
    const fallbackRes = await supabaseFallback.storage
      .from(bucketName)
      .createSignedUploadUrl(key);
    if (!fallbackRes.error && fallbackRes.data) {
      data = fallbackRes.data;
      error = null;
    }
  }

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
 * Generate presigned/signed URL for private file download with fallback support
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
        // Strip non-ASCII characters so storage provider does not percent-encode the filename
        const cleanName = match[1].replace(/[^\x20-\x7E]/g, '').trim();
        downloadOption = cleanName.length > 0 ? cleanName : true;
      } else {
        downloadOption = true;
      }
    }
  }

  const tryGetUrl = async (client: SupabaseClient, targetKey: string) => {
    return await client.storage
      .from(bucketName)
      .createSignedUrl(
        targetKey,
        expiresIn,
        downloadOption !== undefined ? { download: downloadOption } : undefined
      );
  };

  // 1. Primary attempt on active Supabase
  let { data, error } = await tryGetUrl(supabase, key);

  // Fallback key path (root vs ebooks/ folder)
  if (error && (error as any).statusCode === '404') {
    const fallbackKey = key.startsWith("ebooks/")
      ? key.replace(/^ebooks\//, "")
      : `ebooks/${key}`;

    const fallbackResult = await tryGetUrl(supabase, fallbackKey);
    if (!fallbackResult.error && fallbackResult.data) {
      data = fallbackResult.data;
      error = null;
    }
  }

  // 2. Secondary attempt on fallback Supabase if primary failed (quota limit / error)
  if ((error || !data) && supabaseFallback) {
    console.warn(`[STORAGE_FALLBACK] Primary signed URL failed (${error?.message || 'not found'}). Trying fallback Supabase...`);
    let fallbackAttempt = await tryGetUrl(supabaseFallback, key);
    if (fallbackAttempt.error && (fallbackAttempt.error as any).statusCode === '404') {
      const fallbackKey = key.startsWith("ebooks/")
        ? key.replace(/^ebooks\//, "")
        : `ebooks/${key}`;
      fallbackAttempt = await tryGetUrl(supabaseFallback, fallbackKey);
    }
    if (!fallbackAttempt.error && fallbackAttempt.data) {
      data = fallbackAttempt.data;
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
 * Fetch PDF file from Supabase Storage as Buffer (for watermarking / merging) with fallback
 * @param key - Storage Key
 * @returns PDF as Buffer
 */
export async function fetchPdfBuffer(key: string): Promise<Buffer> {
  const bucketName = getBucketName();

  const tryDownload = async (client: SupabaseClient, targetKey: string) => {
    return await client.storage.from(bucketName).download(targetKey);
  };

  // 1. Primary attempt on active Supabase
  let { data, error } = await tryDownload(supabase, key);

  // Fallback for key location (root vs ebooks/ folder)
  if (error && (error as any).statusCode === '404') {
    const fallbackKey = key.startsWith("ebooks/")
      ? key.replace(/^ebooks\//, "")
      : `ebooks/${key}`;

    const fallbackResult = await tryDownload(supabase, fallbackKey);
    if (!fallbackResult.error && fallbackResult.data) {
      data = fallbackResult.data;
      error = null;
    }
  }

  // 2. Secondary attempt on fallback Supabase if primary failed (e.g. quota limit)
  if ((error || !data) && supabaseFallback) {
    console.warn(`[STORAGE_FALLBACK] Primary PDF download failed (${error?.message || 'not found'}). Trying fallback Supabase...`);
    let fallbackAttempt = await tryDownload(supabaseFallback, key);
    if (fallbackAttempt.error && (fallbackAttempt.error as any).statusCode === '404') {
      const fallbackKey = key.startsWith("ebooks/")
        ? key.replace(/^ebooks\//, "")
        : `ebooks/${key}`;
      fallbackAttempt = await tryDownload(supabaseFallback, fallbackKey);
    }
    if (!fallbackAttempt.error && fallbackAttempt.data) {
      data = fallbackAttempt.data;
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



