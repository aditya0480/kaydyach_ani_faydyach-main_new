import fs from "fs";
import path from "path";
import ws from "ws";
if (typeof globalThis.WebSocket === "undefined") {
  (globalThis as any).WebSocket = ws;
}
import { prisma_db } from "../lib/prisma";
import { supabase } from "../lib/s3";
import { extractPage1Image } from "../lib/cover-extractor";

const PNG_DIR = path.join(process.cwd(), "public/output_pngs");
const EBOOKS_DIR = "/Users/prathmesh/Downloads/ebooks";
const EXTENTIONS_FILES_DIR = "/Users/prathmesh/Downloads/extentions/supabase-files";
const EXTENTIONS_DIR = "/Users/prathmesh/Downloads/extentions";

const NAMED_MAP: Record<string, string> = {
  "ebooks/malmatta-vatap-combo-guide-4.pdf": path.join(EBOOKS_DIR, "मालमत्ता,+वाटप+व+कायदेशीर+हक्क+–+कम्प्लीट+कॉम्बो+गाईड+(+3+Books+Set+)NO 4.pdf"),
  "malmatta-vatap-combo-guide-4.pdf": path.join(EBOOKS_DIR, "मालमत्ता,+वाटप+व+कायदेशीर+हक्क+–+कम्प्लीट+कॉम्बो+गाईड+(+3+Books+Set+)NO 4.pdf"),
  "ebooks/vivah-te-ghatsphot-guide-8.pdf": path.join(EBOOKS_DIR, "विवाह ते घटस्फोट हक्कांची पूर्ण मार्गदर्शिका ( 3 Book Set) NO 12.pdf"),
  "vivah-te-ghatsphot-guide-8.pdf": path.join(EBOOKS_DIR, "विवाह ते घटस्फोट हक्कांची पूर्ण मार्गदर्शिका ( 3 Book Set) NO 12.pdf"),
  "ebooks/ghar-ghenyadhi-flat-buy-guide-12.pdf": path.join(EBOOKS_DIR, "घर घेण्याआधी हे वाचाच! – रिसेल, म्हाडा आणि गुंठेवारी फ्लॅट खरेदी ( 3 Book Set) NO 16.pdf"),
  "ghar-ghenyadhi-flat-buy-guide-12.pdf": path.join(EBOOKS_DIR, "घर घेण्याआधी हे वाचाच! – रिसेल, म्हाडा आणि गुंठेवारी फ्लॅट खरेदी ( 3 Book Set) NO 16.pdf"),
  "ebooks/rti-brahmastra-marathi-kit-16.pdf": path.join(EBOOKS_DIR, "RTI ब्रह्मास्त्र अन्यायाविरुद्ध लढण्याचे संपूर्ण किट (३-इन-१).pdf"),
  "rti-brahmastra-marathi-kit-16.pdf": path.join(EBOOKS_DIR, "RTI ब्रह्मास्त्र अन्यायाविरुद्ध लढण्याचे संपूर्ण किट (३-इन-१).pdf"),
  "ebooks/atrocity-act-guide-18.pdf": path.join(EBOOKS_DIR, "EBOOK ॲट्रॉसिटी कायदा तक्रार प्रक्रिया हक्क गैरवापर आणि संरक्षण NO 19.pdf"),
  "atrocity-act-guide-18.pdf": path.join(EBOOKS_DIR, "EBOOK ॲट्रॉसिटी कायदा तक्रार प्रक्रिया हक्क गैरवापर आणि संरक्षण NO 19.pdf"),
  "ebooks/patsanstha-mpid-act-combo-25.pdf": path.join(EBOOKS_DIR, "EBOOK पतसंस्था आणि MPID अधिनियम  कायदे, प्रक्रिया व उपाय-1 NO 25.pdf"),
  "patsanstha-mpid-act-combo-25.pdf": path.join(EBOOKS_DIR, "EBOOK पतसंस्था आणि MPID अधिनियम  कायदे, प्रक्रिया व उपाय-1 NO 25.pdf"),
  "ebooks/zamin-mojani-sandarbh-guide-26.pdf": path.join(EBOOKS_DIR, "EBOOK बांध विवाद जमीन मोजणी व संरक्षण संपूर्ण कायदेशीर मार्गदर्शक NO 26.pdf"),
  "zamin-mojani-sandarbh-guide-26.pdf": path.join(EBOOKS_DIR, "EBOOK बांध विवाद जमीन मोजणी व संरक्षण संपूर्ण कायदेशीर मार्गदर्शक NO 26.pdf"),
  "ebooks/hindu-succession-act-hindi-guide-27.pdf": path.join(EBOOKS_DIR, "EBOOK हिंदू उत्तराधिकार कानून, संपत्ति बंटवारा और ज़मीन विभाजन पूर्ण गाइड NO 27.pdf"),
  "hindu-succession-act-hindi-guide-27.pdf": path.join(EBOOKS_DIR, "EBOOK हिंदू उत्तराधिकार कानून, संपत्ति बंटवारा और ज़मीन विभाजन पूर्ण गाइड NO 27.pdf"),
  "ebooks/rti-brahmastra-hindi-guide-30.pdf": path.join(EXTENTIONS_DIR, "RTI-Brahmastra-Hindi-Guide-Suchna-Ka-Adhikar-2005.pdf"),
  "rti-brahmastra-hindi-guide-30.pdf": path.join(EXTENTIONS_DIR, "RTI-Brahmastra-Hindi-Guide-Suchna-Ka-Adhikar-2005.pdf"),
};

function getLocalPdfPath(fileUrl: string): string | null {
  if (NAMED_MAP[fileUrl]) return NAMED_MAP[fileUrl];

  const clean = fileUrl.replace(/^ebooks\//, "");
  const p1 = path.join(EXTENTIONS_FILES_DIR, clean);
  if (fs.existsSync(p1)) return p1;

  const p2 = path.join(EXTENTIONS_DIR, clean);
  if (fs.existsSync(p2)) return p2;

  const p3 = path.join(EBOOKS_DIR, clean);
  if (fs.existsSync(p3)) return p3;

  return null;
}

async function main() {
  const ebooks = await prisma_db.ebook.findMany({
    include: { includedEbooks: { include: { ebook: true } } },
    orderBy: { displayId: "asc" },
  });

  console.log(`Processing ${ebooks.length} ebooks...`);
  const pngFiles = fs.readdirSync(PNG_DIR);

  for (const eb of ebooks) {
    let targetKey = eb.fileUrl;
    if (eb.isCombo && (!targetKey || targetKey === "COMBO_COLLECTION") && eb.includedEbooks.length > 0) {
      targetKey = eb.includedEbooks[0]?.ebook?.fileUrl;
    }

    if (!targetKey || targetKey === "COMBO_COLLECTION") {
      console.warn(`[SKIP] No targetKey for #${eb.displayId} ${eb.title}`);
      continue;
    }

    const cleanKey = targetKey.replace(/^ebooks\//, "").replace(/\.pdf$/, "");
    const matchingPng = pngFiles.find((p) => p.startsWith(cleanKey));

    let coverBuf: Buffer | null = null;
    let contentType = "image/jpeg";

    if (matchingPng) {
      coverBuf = fs.readFileSync(path.join(PNG_DIR, matchingPng));
      contentType = "image/png";
      console.log(`[PNG MATCH] #${eb.displayId} ${eb.title} -> ${matchingPng}`);
    } else {
      const localPdf = getLocalPdfPath(targetKey);
      if (localPdf && fs.existsSync(localPdf)) {
        const pdfBuf = fs.readFileSync(localPdf);
        const ext = await extractPage1Image(pdfBuf);
        if (ext) {
          coverBuf = ext.buffer;
          contentType = ext.contentType;
          console.log(`[EXTRACT OK] #${eb.displayId} ${eb.title} from ${path.basename(localPdf)}`);
        }
      }
    }

    if (coverBuf) {
      // 1. Upload as covers/${eb.id}.jpg
      await supabase.storage.from("pdfs").upload(`covers/${eb.id}.jpg`, coverBuf, {
        contentType,
        upsert: true,
      });

      // 2. Upload as covers/${eb.id}.png
      await supabase.storage.from("pdfs").upload(`covers/${eb.id}.png`, coverBuf, {
        contentType,
        upsert: true,
      });

      // 3. Upload under cleanKey for direct key access
      await supabase.storage.from("pdfs").upload(`covers/${cleanKey}.jpg`, coverBuf, {
        contentType,
        upsert: true,
      });

      console.log(`✔ Cached covers for #${eb.displayId} ${eb.title}`);
    } else {
      console.error(`❌ Could not get cover for #${eb.displayId} ${eb.title}`);
    }
  }

  console.log("\nAll covers preloaded and cached to Supabase successfully!");
}

main().catch(console.error).finally(() => process.exit(0));
