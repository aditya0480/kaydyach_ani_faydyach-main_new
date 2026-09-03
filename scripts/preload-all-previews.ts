import fs from "fs";
import path from "path";
import ws from "ws";
if (typeof globalThis.WebSocket === "undefined") {
  (globalThis as any).WebSocket = ws;
}
import { prisma_db } from "../lib/prisma";
import { supabase } from "../lib/s3";
import { PDFDocument } from "pdf-lib";

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

  console.log(`Preloading 6-page previews for ${ebooks.length} ebooks...`);

  for (const eb of ebooks) {
    let targetKey = eb.fileUrl;
    if (eb.isCombo && (!targetKey || targetKey === "COMBO_COLLECTION") && eb.includedEbooks.length > 0) {
      targetKey = eb.includedEbooks[0]?.ebook?.fileUrl;
    }

    if (!targetKey || targetKey === "COMBO_COLLECTION") {
      console.warn(`[SKIP] No targetKey for #${eb.displayId} ${eb.title}`);
      continue;
    }

    const localPdf = getLocalPdfPath(targetKey);
    if (!localPdf || !fs.existsSync(localPdf)) {
      console.warn(`[NOT FOUND] Local PDF for #${eb.displayId}: ${targetKey}`);
      continue;
    }

    try {
      const fullPdfBuffer = fs.readFileSync(localPdf);
      const pdfDoc = await PDFDocument.load(fullPdfBuffer);
      const count = Math.min(6, pdfDoc.getPageCount());

      const subDoc = await PDFDocument.create();
      const pageIndices = Array.from({ length: count }, (_, i) => i);
      const copiedPages = await subDoc.copyPages(pdfDoc, pageIndices);
      copiedPages.forEach((page) => subDoc.addPage(page));

      const previewPdfBytes = await subDoc.save();
      const previewBuffer = Buffer.from(previewPdfBytes);

      const previewStorageKey = `previews/${eb.id}.pdf`;
      const { error } = await supabase.storage.from("pdfs").upload(previewStorageKey, previewBuffer, {
        contentType: "application/pdf",
        upsert: true,
      });

      if (error) {
        console.error(`❌ Upload failed for #${eb.displayId}: ${error.message}`);
      } else {
        console.log(`✔ Preloaded preview for #${eb.displayId} ${eb.title} (${(previewBuffer.length / 1024).toFixed(1)} KB)`);
      }
    } catch (e: any) {
      console.error(`❌ Error generating preview for #${eb.displayId}: ${e.message}`);
    }
  }

  console.log("\nAll previews generated and uploaded to Supabase Storage!");
}

main().catch(console.error).finally(() => process.exit(0));
