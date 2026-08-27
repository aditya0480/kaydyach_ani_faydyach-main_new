/**
 * Clean, descriptive English filenames for all ebooks to ensure proper downloading
 * on all mobile & desktop operating systems (avoiding %E0%A4 URL-encoded gibberish).
 */
export const EBOOK_DOWNLOAD_FILENAMES: Record<number, string> = {
  1: "Hindu-Varas-Kayda-1956.pdf",
  2: "Malmatta-Vatap-Ani-Hakk.pdf",
  3: "Vatap-Prakriya-Arja-Va-Namune.pdf",
  4: "Malmatta-Vatap-Complete-Combo-3-Books.pdf",
  5: "Hindu-Vivah-Adhiniyam-1955.pdf",
  6: "Ghatsphat-Kayda-Va-Prakriya.pdf",
  7: "Potgi-Ani-Hakk-Margadarshika.pdf",
  8: "Vivah-Te-Ghatsphat-Complete-Combo-3-Books.pdf",
  9: "RERA-Kayda-Sopya-Bhashet.pdf",
  10: "RERA-Plot-Kharedi-Investment-Guide.pdf",
  11: "Ghar-Ghenyadhi-He-Vachach-Flat-Resale-Mhada.pdf",
  12: "Ghar-Ghenyadhi-He-Vachach-Combo-3-Books.pdf",
  13: "Mahiticha-Adhikar-RTI-Adhiniyam-2005.pdf",
  14: "RTI-2005-Shaskiya-Va-Sahakari-Sanstha.pdf",
  15: "Tumcha-RTI-Arja-100-Percent-Swikarala-Jail.pdf",
  16: "RTI-Brahmastra-Anyayaviruddha-3-in-1-Kit.pdf",
  17: "Atrocity-Kayda-Adhiniyam-1989.pdf",
  18: "Atrocity-Kayda-Takrar-Prakriya-Gairatak-Sanrakshan.pdf",
  19: "Atrocity-Kayda-Complete-2-Book-Set.pdf",
  20: "Lagna-Fasavnuk-Ani-Upay.pdf",
  21: "Hunda-Pratibandh-Kayda-Hakk-Sanrakshan.pdf",
  22: "Lagna-Fasavnuk-Plus-Hunda-Pratibandh-2-Book-Set.pdf",
  23: "Maharashtra-Thevidar-Sanrakshan-MPID-1999.pdf",
  24: "Patsanstha-Surakshit-Guntavnuk-Kaydeshir-Sanrakshan.pdf",
  25: "Patsanstha-Fasavnuk-MPID-Combo-Offer.pdf",
  26: "Zamin-Mojani-Bandh-Vivad-Sampurna-Margadarshak.pdf",
  27: "Hindu-Succession-Act-Hindi-Guide-Sampatti-Bantwara.pdf",
  28: "Usacha-Hishob-Ani-Kaydeshir-Ladha.pdf",
  29: "Hakkasodpatra-Hissa-Parat-Milvine-Upay.pdf",
  30: "RTI-Brahmastra-Hindi-Guide-Suchna-Ka-Adhikar-2005.pdf",
  31: "Vadiloparjit-Jamin-Ekach-Bhavane-Vikli-Tar-Kay-Karal.pdf",
};

/**
 * Returns a clean, safe, valid ASCII filename for download headers.
 */
export function getSafeDownloadFilename(
  displayId?: number | null,
  title?: string | null,
  fallback = "Kaydyacha_Ani_Faydyacha_Ebook.pdf"
): string {
  if (displayId && EBOOK_DOWNLOAD_FILENAMES[displayId]) {
    return EBOOK_DOWNLOAD_FILENAMES[displayId];
  }

  if (title) {
    // Strip non-ASCII characters to prevent URL-encoded filenames (%E0%A4...)
    const asciiClean = title
      .replace(/[^\x20-\x7E]/g, '')
      .replace(/["/\\:;*?<>|]/g, '')
      .trim()
      .replace(/\s+/g, '-');

    if (asciiClean.length >= 3) {
      return `${asciiClean.substring(0, 45)}.pdf`;
    }
  }

  return fallback;
}
