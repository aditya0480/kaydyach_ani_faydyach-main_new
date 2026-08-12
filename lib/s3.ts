import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getSignedUrl as getCloudFrontUrl } from "@aws-sdk/cloudfront-signer";
import crypto from "crypto";

// Initialize S3 client
export const s3Client = new S3Client({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

/**
 * Upload file to S3 bucket
 * @param file - File buffer to upload
 * @param originalFilename - Original filename (optional, for extension)
 * @returns Public URL of uploaded file
 */
export async function uploadToS3(
  file: Buffer,
  originalFilename?: string
): Promise<string> {
  try {
    // Generate unique filename
    const fileExtension = originalFilename
      ? originalFilename.split(".").pop()
      : "jpg";
    const uniqueFilename = `avatars/${crypto.randomUUID()}.${fileExtension}`;

    const bucketName = process.env.S3_BUCKET_NAME;
    if (!bucketName) {
      throw new Error("S3_BUCKET_NAME environment variable is not set");
    }

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: uniqueFilename,
      Body: file,
      ContentType: `image/${fileExtension}`,
    });

    await s3Client.send(command);

    // Return CloudFront URL instead of direct S3 URL
    const domain = process.env.CLOUDFRONT_DOMAIN;
    if (domain) {
      return `https://${domain}/${uniqueFilename}`;
    }

    // Fallback to public S3 URL if CloudFront is not set
    const publicUrl = `https://${bucketName}.s3.${process.env.AWS_REGION || "ap-south-1"}.amazonaws.com/${uniqueFilename}`;

    return publicUrl;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw new Error("Failed to upload file to S3");
  }
}

/**
 * Upload private file to S3 bucket (for Ebooks)
 * @param file - File buffer
 * @param originalFilename - Original filename
 * @returns S3 Key
 */
export async function uploadPaymentScreenshot(
  file: Buffer,
  contentType: string
): Promise<string> {
  const ext = contentType.split("/")[1] || "jpg";
  const uniqueKey = `payment-screenshots/${crypto.randomUUID()}.${ext}`;
  const bucketName = process.env.S3_BUCKET_NAME;
  if (!bucketName) throw new Error("S3_BUCKET_NAME not set");

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: uniqueKey,
    Body: file,
    ContentType: contentType,
  });

  await s3Client.send(command);
  return uniqueKey;
}

export async function uploadPrivateFile(
  file: Buffer,
  originalFilename: string
): Promise<string> {
  const fileExtension = originalFilename.split(".").pop();
  const uniqueKey = `ebooks/${crypto.randomUUID()}.${fileExtension}`;
  const bucketName = process.env.S3_BUCKET_NAME;

  if (!bucketName) throw new Error("S3_BUCKET_NAME not set");

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: uniqueKey,
    Body: file,
    ContentType: "application/pdf", // Assuming PDF mostly
    // ACL is not set, so it relies on bucket policy (should be private by default)
  });

  await s3Client.send(command);
  return uniqueKey;
}

/**
 * Generate presigned URL for direct-from-browser upload (PUT).
 * Caller PUTs the file body to this URL with the same Content-Type.
 */
export async function getUploadPresignedUrl(
  key: string,
  contentType: string,
  expiresIn = 600
): Promise<string> {
  const bucketName = process.env.S3_BUCKET_NAME;
  if (!bucketName) throw new Error("S3_BUCKET_NAME not set");

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Build public URL (CloudFront if configured, else direct S3) for a key.
 */
export function getPublicUrlForKey(key: string): string {
  const domain = process.env.CLOUDFRONT_DOMAIN;
  if (domain) return `https://${domain}/${key}`;
  const bucketName = process.env.S3_BUCKET_NAME;
  const region = process.env.AWS_REGION || "ap-south-1";
  return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
}

/**
 * Generate CloudFront Signed URL for private file
 * @param key - S3 Key
 * @param expiresIn - Expiry in seconds (default 3600 = 1 hour)
 */
export async function getCloudFrontSignedUrl(
  key: string,
  expiresIn = 3600
): Promise<string> {
  const domain = process.env.CLOUDFRONT_DOMAIN;
  const keyPairId = process.env.CLOUDFRONT_PUBLIC_KEY_ID;
  const privateKey = process.env.CLOUDFRONT_PRIVATE_KEY;

  if (!domain) throw new Error("CLOUDFRONT_DOMAIN not set");

  // Fallback to S3 presigned URL if keys are missing
  if (!keyPairId || !privateKey) {
    console.warn("[S3_UTIL] CloudFront keys missing, falling back to S3 Presigned URL");
    return getPresignedUrl(key, expiresIn);
  }

  // Encode the key to handle spaces and special characters (Marathi)
  const encodedKey = key.split('/').map(segment => encodeURIComponent(segment)).join('/');
  const url = `https://${domain}/${encodedKey}`;
  const dateLessThan = new Date(Date.now() + expiresIn * 1000).toISOString();

  try {
    return getCloudFrontUrl({
      url,
      keyPairId,
      privateKey: privateKey.replace(/\\n/g, '\n'),
      dateLessThan,
    });
  } catch (error) {
    console.error("[S3_UTIL] CloudFront Signing Failed:", error);
    return getPresignedUrl(key, expiresIn);
  }
}

/**
 * Generate presigned URL for private file
 * @param key - S3 Key
 * @param expiresIn - Expiry in seconds (default 3600 = 1 hour)
 * @param responseContentDisposition - Optional Content-Disposition header (for filename)
 * @param responseContentType - Optional Content-Type header
 */
export async function getPresignedUrl(
  key: string,
  expiresIn = 3600,
  responseContentDisposition?: string,
  responseContentType?: string
): Promise<string> {
  const bucketName = process.env.S3_BUCKET_NAME;
  if (!bucketName) throw new Error("S3_BUCKET_NAME not set");

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
    ResponseContentDisposition: responseContentDisposition,
    ResponseContentType: responseContentType,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Fetch PDF file from S3 as Buffer (for watermarking)
 * @param key - S3 Key
 * @returns PDF as Buffer
 */
export async function fetchPdfBuffer(key: string): Promise<Buffer> {
  const bucketName = process.env.S3_BUCKET_NAME;
  if (!bucketName) throw new Error("S3_BUCKET_NAME not set");

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  const response = await s3Client.send(command);

  if (!response.Body) {
    throw new Error("No PDF body in S3 response");
  }

  // Convert stream to buffer
  const chunks: Uint8Array[] = [];
  for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
    chunks.push(chunk);
  }

  const buffer = Buffer.concat(chunks);
  return buffer;
}


