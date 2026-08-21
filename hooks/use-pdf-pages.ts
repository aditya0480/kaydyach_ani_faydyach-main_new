"use client";

import { useState, useEffect } from "react";

// Global cache for rendered data URLs so they only render once per session
const pageCache = new Map<string, string[]>();

export function usePdfPages(ebookId?: string, initialCover?: string | null) {
  const [pages, setPages] = useState<string[]>(() => {
    if (ebookId && pageCache.has(ebookId)) {
      return pageCache.get(ebookId)!;
    }
    return initialCover ? [initialCover] : [];
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ebookId) return;

    if (pageCache.has(ebookId)) {
      setPages(pageCache.get(ebookId)!);
      setIsLoading(false);
      return;
    }

    let isCancelled = false;

    async function loadPdfPages() {
      try {
        setIsLoading(true);

        // Dynamically load PDF.js from Cloudflare cdnjs
        if (typeof window !== "undefined" && !(window as any).pdfjsLib) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
            script.onload = () => {
              try {
                (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc =
                  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
                resolve();
              } catch (e) {
                reject(e);
              }
            };
            script.onerror = () => reject(new Error("Failed to load PDF.js"));
            document.head.appendChild(script);
          });
        }

        const pdfjs = (window as any).pdfjsLib;
        if (!pdfjs) {
          throw new Error("PDF.js library not available");
        }

        const loadingTask = pdfjs.getDocument(`/api/preview/${ebookId}`);
        const pdf = await loadingTask.promise;
        const pageCount = Math.min(6, pdf.numPages);
        const rendered: string[] = [];

        for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
          if (isCancelled) return;
          const page = await pdf.getPage(pageNum);
          // Scale 1.5 gives high-DPI retina sharpness without excessive memory
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          if (ctx) {
            await page.render({
              canvasContext: ctx,
              viewport,
            }).promise;

            const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
            rendered.push(dataUrl);
          }
        }

        if (!isCancelled && rendered.length > 0) {
          if (ebookId) {
            pageCache.set(ebookId, rendered);
          }
          setPages(rendered);
        }
      } catch (err) {
        console.warn(`[PDF_PAGES_HOOK] Error rendering PDF for ${ebookId}:`, err);
        setError(err instanceof Error ? err.message : "Failed to load PDF pages");
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadPdfPages();

    return () => {
      isCancelled = true;
    };
  }, [ebookId]);

  return { pages, isLoading, error };
}
