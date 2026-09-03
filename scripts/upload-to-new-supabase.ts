import fs from "fs";
import path from "path";
import ws from "ws";
if (typeof globalThis.WebSocket === "undefined") {
  (globalThis as any).WebSocket = ws;
}
import { createClient } from "@supabase/supabase-js";
import { prisma_db } from "../lib/prisma";

const NEW_SUPABASE_URL = "https://iotvhtkmpuclhnyzxsyk.supabase.co";
const NEW_SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvdHZodGttcHVjbGhueXp4c3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODQzMTYxMCwiZXhwIjoyMTA0MDA3NjEwfQ.GPujrkJOKcdoxG0bEtNQZYNxdBY_0L75C7CpbpJ7ayg";
const BUCKET = "pdfs";

const supabase = createClient(NEW_SUPABASE_URL, NEW_SUPABASE_KEY);

const EBOOKS_DIR = "/Users/prathmesh/Downloads/ebooks";
const EXTENTIONS_FILES_DIR = "/Users/prathmesh/Downloads/extentions/supabase-files";
const EXTENTIONS_DIR = "/Users/prathmesh/Downloads/extentions";
const OUTPUT_PNGS_DIR = path.join(process.cwd(), "public/output_pngs");

async function fileExistsInBucket(key: string): Promise<boolean> {
  try {
    const dir = key.includes("/") ? key.substring(0, key.lastIndexOf("/")) : "";
    const filename = key.includes("/") ? key.substring(key.lastIndexOf("/") + 1) : key;
    const { data } = await supabase.storage.from(BUCKET).list(dir, {
      search: filename,
    });
    return (data || []).some((item) => item.name === filename);
  } catch {
    return false;
  }
}

async function uploadFileWithRetry(key: string, filePath: string, contentType: string, retries = 3) {
  if (!fs.existsSync(filePath)) {
    console.warn(`[SKIP] Local file not found: ${filePath}`);
    return false;
  }

  const alreadyExists = await fileExistsInBucket(key);
  if (alreadyExists) {
    console.log(`[ALREADY EXISTS] ${key} - Skipping`);
    return true;
  }

  const fileBuffer = fs.readFileSync(filePath);
  console.log(`[UPLOADING] ${key} (${(fileBuffer.length / 1024 / 1024).toFixed(2)} MB)...`);

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const { error } = await supabase.storage.from(BUCKET).upload(key, fileBuffer, {
        contentType,
        upsert: true,
      });
      if (!error) {
        console.log(`[SUCCESS] Uploaded ${key}`);
        return true;
      }
      console.warn(`[RETRY ${attempt}/${retries}] Upload failed for ${key}:`, error.message);
    } catch (err: any) {
      console.warn(`[RETRY ${attempt}/${retries}] Upload exception for ${key}:`, err.message);
    }
    await new Promise((r) => setTimeout(r, 2000 * attempt));
  }
  console.error(`[FAILED] Could not upload ${key} after ${retries} attempts`);
  return false;
}

async function main() {
  console.log("=== 1. Checking Bucket ===");
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.some((b) => b.name === BUCKET)) {
    await supabase.storage.createBucket(BUCKET, { public: true, fileSizeLimit: 52428800 });
  }

  console.log("\n=== 2. Uploading Named Ebook PDFs ===");
  const namedEbookFiles: Record<string, string> = {
    "ebooks/patsanstha-mpid-act-combo-25.pdf": path.join(EBOOKS_DIR, "EBOOK पतसंस्था आणि MPID अधिनियम  कायदे, प्रक्रिया व उपाय-1 NO 25.pdf"),
    "patsanstha-mpid-act-combo-25.pdf": path.join(EBOOKS_DIR, "EBOOK पतसंस्था आणि MPID अधिनियम  कायदे, प्रक्रिया व उपाय-1 NO 25.pdf"),
    "ebooks/zamin-mojani-sandarbh-guide-26.pdf": path.join(EBOOKS_DIR, "EBOOK बांध विवाद जमीन मोजणी व संरक्षण संपूर्ण कायदेशीर मार्गदर्शक NO 26.pdf"),
    "zamin-mojani-sandarbh-guide-26.pdf": path.join(EBOOKS_DIR, "EBOOK बांध विवाद जमीन मोजणी व संरक्षण संपूर्ण कायदेशीर मार्गदर्शक NO 26.pdf"),
    "ebooks/atrocity-act-guide-18.pdf": path.join(EBOOKS_DIR, "EBOOK ॲट्रॉसिटी कायदा तक्रार प्रक्रिया हक्क गैरवापर आणि संरक्षण NO 19.pdf"),
    "atrocity-act-guide-18.pdf": path.join(EBOOKS_DIR, "EBOOK ॲट्रॉसिटी कायदा तक्रार प्रक्रिया हक्क गैरवापर आणि संरक्षण NO 19.pdf"),
    "ebooks/rti-brahmastra-marathi-kit-16.pdf": path.join(EBOOKS_DIR, "RTI ब्रह्मास्त्र अन्यायाविरुद्ध लढण्याचे संपूर्ण किट (३-इन-१).pdf"),
    "rti-brahmastra-marathi-kit-16.pdf": path.join(EBOOKS_DIR, "RTI ब्रह्मास्त्र अन्यायाविरुद्ध लढण्याचे संपूर्ण किट (३-इन-१).pdf"),
    "ebooks/ghar-ghenyadhi-flat-buy-guide-12.pdf": path.join(EBOOKS_DIR, "घर घेण्याआधी हे वाचाच! – रिसेल, म्हाडा आणि गुंठेवारी फ्लॅट खरेदी ( 3 Book Set) NO 16.pdf"),
    "ghar-ghenyadhi-flat-buy-guide-12.pdf": path.join(EBOOKS_DIR, "घर घेण्याआधी हे वाचाच! – रिसेल, म्हाडा आणि गुंठेवारी फ्लॅट खरेदी ( 3 Book Set) NO 16.pdf"),
    "ebooks/malmatta-vatap-combo-guide-4.pdf": path.join(EBOOKS_DIR, "मालमत्ता,+वाटप+व+कायदेशीर+हक्क+–+कम्प्लीट+कॉम्बो+गाईड+(+3+Books+Set+)NO 4.pdf"),
    "malmatta-vatap-combo-guide-4.pdf": path.join(EBOOKS_DIR, "मालमत्ता,+वाटप+व+कायदेशीर+हक्क+–+कम्प्लीट+कॉम्बो+गाईड+(+3+Books+Set+)NO 4.pdf"),
    "ebooks/vivah-te-ghatsphot-guide-8.pdf": path.join(EBOOKS_DIR, "विवाह ते घटस्फोट हक्कांची पूर्ण मार्गदर्शिका ( 3 Book Set) NO 12.pdf"),
    "vivah-te-ghatsphot-guide-8.pdf": path.join(EBOOKS_DIR, "विवाह ते घटस्फोट हक्कांची पूर्ण मार्गदर्शिका ( 3 Book Set) NO 12.pdf"),
  };

  for (const [key, filePath] of Object.entries(namedEbookFiles)) {
    await uploadFileWithRetry(key, filePath, "application/pdf");
  }

  console.log("\n=== 3. Uploading UUID Ebook PDFs ===");
  const uuidFiles = [
    "32024106-e545-4e4d-aaa4-f6cf8b052eef.pdf",
    "6423850e-bcc5-40f5-9d4a-faf4762c9743.pdf",
    "78652065-3cd9-4e21-8fb4-77af34544121.pdf",
    "abb790fc-5b76-42a8-b990-9af88e803244.pdf",
    "c65245b8-1188-475b-9553-600e9fe820dd.pdf",
    "dc970d3a-95cb-4d60-8e4d-7e3096994c95.pdf",
    "e2c66358-6578-41c0-bd23-6a2489d3354d.pdf",
    "e8de4689-5262-49c8-8edb-0e201575ac04.pdf",
    "fd414b1c-7f83-491e-82b5-3071eb38e2db.pdf",
    "31c5a789-6f51-4fd1-b200-cc66c01edb2c.pdf",
    "160a495d-e562-4e49-a871-63bed6913576.pdf",
    "bfd9c8b8-fdad-4db6-becc-77c919b6390a.pdf",
  ];

  for (const filename of uuidFiles) {
    let filePath = path.join(EXTENTIONS_FILES_DIR, filename);
    if (!fs.existsSync(filePath)) {
      filePath = path.join(EXTENTIONS_DIR, filename);
    }
    if (fs.existsSync(filePath)) {
      await uploadFileWithRetry(filename, filePath, "application/pdf");
      await uploadFileWithRetry(`ebooks/${filename}`, filePath, "application/pdf");
    }
  }

  console.log("\n=== 4. Uploading PNG Covers / Avatars ===");
  if (fs.existsSync(OUTPUT_PNGS_DIR)) {
    const pngFiles = fs.readdirSync(OUTPUT_PNGS_DIR).filter((f) => f.endsWith(".png"));
    for (const file of pngFiles) {
      const filePath = path.join(OUTPUT_PNGS_DIR, file);
      await uploadFileWithRetry(`avatars/${file}`, filePath, "image/png");
      await uploadFileWithRetry(`covers/${file}`, filePath, "image/png");
    }
  }

  console.log("\n=== 5. Updating Database Cover URLs to New Supabase ===");
  const ebooks = await prisma_db.ebook.findMany();
  let updatedCount = 0;
  for (const ebook of ebooks) {
    if (ebook.coverImage && ebook.coverImage.includes("teagvjwonsazimphvqzh.supabase.co")) {
      const newCoverUrl = ebook.coverImage.replace("teagvjwonsazimphvqzh.supabase.co", "iotvhtkmpuclhnyzxsyk.supabase.co");
      await prisma_db.ebook.update({
        where: { id: ebook.id },
        data: { coverImage: newCoverUrl },
      });
      updatedCount++;
    }
  }
  console.log(`Updated ${updatedCount} ebooks with new Supabase coverImage URLs.`);

  console.log("\n=== 6. Validating uploaded files in bucket ===");
  const { data: rootList } = await supabase.storage.from(BUCKET).list("", { limit: 100 });
  const { data: ebooksList } = await supabase.storage.from(BUCKET).list("ebooks", { limit: 100 });
  const { data: avatarsList } = await supabase.storage.from(BUCKET).list("avatars", { limit: 100 });
  console.log(`Root files: ${rootList?.length || 0}`);
  console.log(`Ebooks folder files: ${ebooksList?.length || 0}`);
  console.log(`Avatars folder files: ${avatarsList?.length || 0}`);

  console.log("\nAll migration tasks finished successfully!");
}

main().catch(console.error).finally(() => process.exit(0));
