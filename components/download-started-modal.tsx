"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, CheckCircle2, FolderDown, ArrowDownToLine, RefreshCw } from "lucide-react";

interface DownloadStartedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  downloadUrl?: string;
}

export function DownloadStartedModal({
  open,
  onOpenChange,
  title,
  downloadUrl,
}: DownloadStartedModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-3xl border-2 border-brand-teal/10 bg-white p-6 text-center shadow-2xl">
        <DialogHeader className="flex flex-col items-center">
          {/* Animated Download Ring Icon */}
          <div className="relative mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-teal-600">
            <div className="absolute inset-0 animate-ping rounded-full bg-teal-100 opacity-40" />
            <ArrowDownToLine className="relative h-8 w-8 animate-bounce text-brand-teal" />
          </div>

          <DialogTitle className="text-xl font-black text-brand-teal">
            डाउनलोड सुरू झाले आहे!
          </DialogTitle>

          <DialogDescription className="mt-1 text-xs font-semibold text-gray-500">
            तुमची PDF फाइल थेट तुमच्या डिव्हाइसवर सेव्ह होत आहे.
          </DialogDescription>
        </DialogHeader>

        {title && (
          <div className="my-2 rounded-xl bg-gray-50 p-3 text-left">
            <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
              पुस्तक (Book)
            </p>
            <p className="mt-0.5 text-xs font-bold text-gray-800 line-clamp-2">
              {title}
            </p>
          </div>
        )}

        {/* Where to find the file info box */}
        <div className="rounded-2xl border border-teal-100 bg-teal-50/70 p-3.5 text-left">
          <div className="flex items-center gap-2 text-xs font-bold text-teal-900">
            <FolderDown className="h-4 w-4 text-teal-600 shrink-0" />
            <span>फाइल कुठे शोधाल? (Where to find?)</span>
          </div>
          <ul className="mt-2 space-y-1 text-[11px] font-medium text-teal-800/90">
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 shrink-0 mt-0.5" />
              <span>मोबाईलच्या <strong>&quot;Downloads&quot;</strong> किंवा <strong>&quot;Files&quot;</strong> फोल्डरमध्ये.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 shrink-0 mt-0.5" />
              <span>किंवा ब्राउझरच्या मेनूमध्ये (३ ठिपके) <strong>Downloads</strong> तपासा.</span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="mt-3 flex flex-col gap-2">
          <Button
            onClick={() => onOpenChange(false)}
            className="h-11 w-full rounded-xl bg-brand-teal text-xs font-bold text-white shadow-md shadow-brand-teal/20 transition-all hover:bg-brand-teal/90 active:scale-[0.98]"
          >
            समजले (Got it)
          </Button>

          {downloadUrl && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-9 w-full rounded-xl border-gray-200 text-[11px] font-bold text-gray-600 hover:bg-gray-50"
            >
              <a href={downloadUrl} download>
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                डाउनलोड सुरू झाले नाही? पुन्हा क्लिक करा
              </a>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
