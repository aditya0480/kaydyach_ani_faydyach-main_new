"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  HelpCircle,
  FolderSearch,
  Smartphone,
  MoreVertical,
  Download,
} from "lucide-react";

interface DownloadInstructionsProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function DownloadInstructions({
  open,
  onOpenChange,
}: DownloadInstructionsProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 rounded-lg px-3 text-xs font-bold text-gray-500 hover:bg-gray-100 hover:text-gray-900"
        >
          <HelpCircle className="h-3.5 w-3.5" />
          PDF कुठे मिळेल?
        </Button>
      </DialogTrigger>
      <DialogContent className="w-100 max-w-[90%] overflow-hidden rounded-2xl border-none p-0 outline-none sm:max-w-md">
        {/* Header with colored background */}
        <div className="bg-brand-teal/10 px-6 py-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-teal text-white shadow-lg shadow-brand-teal/20">
            <FolderSearch className="h-6 w-6" />
          </div>
          <DialogTitle className="text-lg font-black text-gray-800">
            डाऊनलोड केलेली PDF कुठे मिळेल?
          </DialogTitle>
          <DialogDescription className="mt-1 text-xs font-medium text-gray-500">
            फाइल शोधण्यासाठी खालील स्टेप्स फॉलो करा
          </DialogDescription>
        </div>

        <div className="space-y-6 px-6 pt-4 pb-8">
          {/* Step 1: WhatsApp (New) */}
          <div className="relative flex gap-4">
            <div className="flex-none">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-green-200 bg-green-50 text-xs font-black text-green-600">
                1
              </div>
            </div>
            <div className="space-y-1 pt-1">
              <p className="text-sm font-bold text-gray-800">
                WhatsApp वर पाहा (सर्वात सोपे)
              </p>
              <p className="text-xs leading-relaxed text-gray-500">
                पेमेंट यशस्वी झाल्यावर पुढील ५ मिनिटात तुमच्या WhatsApp वर PDF पाठवली जाते. तिथे ती कधीही पुन्हा डाऊनलोड करता येईल.
              </p>
            </div>
          </div>

          <div className="relative flex justify-center">
            <div className="h-px w-full max-w-50 bg-gray-100"></div>
          </div>

          {/* Step 2: Browser Menu */}
          <div className="relative flex gap-4">
            <div className="flex-none">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-xs font-black text-gray-600">
                2
              </div>
            </div>
            <div className="space-y-1 pt-1">
              <p className="text-sm font-bold text-gray-800">
                डाऊनलोड्स (Downloads) फोल्डर
              </p>
              <p className="text-xs leading-relaxed text-gray-500">
                जर तुम्ही &quot;डाऊनलोड&quot; बटन दाबले असेल, तर ब्राउझरच्या मेनूमध्ये{" "}
                <MoreVertical className="mx-1 inline h-3 w-3 text-gray-400" />{" "}
                <span className="font-bold text-gray-700">Downloads</span>{" "}
                <Download className="mx-1 inline h-3 w-3 text-gray-400" />{" "}
                निवडा.
              </p>
            </div>
          </div>

          <div className="relative flex justify-center">
            <div className="h-px w-full max-w-50 bg-gray-100"></div>
          </div>

          {/* Step 3: File Manager */}
          <div className="relative flex gap-4">
            <div className="flex-none">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-xs font-black text-gray-600">
                3
              </div>
            </div>
            <div className="space-y-1 pt-1">
              <p className="text-sm font-bold text-gray-800">
                मोबाईलमधील &quot;File Manager&quot;
              </p>
              <p className="text-xs leading-relaxed text-gray-500">
                तुमच्या मोबाईलमधील{" "}
                <span className="font-bold text-gray-700">File Manager</span> /{" "}
                <span className="font-bold text-gray-700">My Files</span>{" "}
                <Smartphone className="mx-1 inline h-3 w-3 text-gray-400" /> मध्ये{" "}
                <span className="font-bold text-gray-700">Documents</span> फोल्डर चेक करा.
              </p>
            </div>
          </div>

          <div className="relative flex justify-center">
            <div className="h-px w-full max-w-50 bg-gray-100"></div>
          </div>

          {/* Step 4: Help */}
          <div className="relative flex gap-4">
            <div className="flex-none">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-teal-200 bg-teal-50 text-xs font-black text-teal-600">
                4
              </div>
            </div>
            <div className="space-y-1 pt-1">
              <p className="text-sm font-bold text-gray-800">काहीच सापडत नसेल तर?</p>
              <p className="text-xs leading-relaxed text-gray-500">
                काळजी करू नका! मुख्य स्क्रीनवरील <span className="font-bold text-brand-teal">मदत हवी?</span> बटनावर क्लिक करा. आम्ही तुम्हाला व्हॉट्सअप वर फाईल पाठवू.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
