"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { PageTransition } from "@/components/navigation/page-transition";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { handlePlatformShare } from "@/lib/get-share-url";
import { AnimatePresence } from "motion/react";
import { LinkIcon, Share2Icon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { TbBrandBluesky, TbBrandX } from "react-icons/tb";

export default function Template({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const isSuccess = searchParams.has("success");
  const isUpdated = searchParams.has("updated");
  const showModal = isSuccess || isUpdated;

  useEffect(() => {
    if (showModal) {
      setShowSuccessModal(true);
    }
  }, [showModal]);

  const handleClose = () => {
    setShowSuccessModal(false);
    // Remove the success or updated param from URL
    const url = new URL(window.location.href);
    url.searchParams.delete("success");
    url.searchParams.delete("updated");
    router.replace(url.pathname);
  };

  const getDialogTitle = () => {
    if (isUpdated) return "Post Updated!";
    return "Post Published!";
  };

  const getDialogDescription = () => {
    if (isUpdated) return "Your post has been successfully updated. Share it again with your audience!";
    return "Congratulations! Your post has been successfully published. Time to share it with the world!";
  };

  return (
    <>
      <AnimatePresence mode="wait">
        <PageTransition type="full">{children}</PageTransition>
      </AnimatePresence>

      <Dialog open={showSuccessModal} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="h-8 flex items-center">{getDialogTitle()}</DialogTitle>
            <DialogDescription>{getDialogDescription()}</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 mt-6">
            {/* <Button variant="outline" onClick={() => handlePlatformShare("lens")} className="w-full justify-start">
              <Share2Icon size={16} />
              Share to Lens
            </Button> */}
            <Button variant="outline" onClick={() => handlePlatformShare("bluesky")} className="w-full justify-start">
              <TbBrandBluesky />
              Share to Bluesky
            </Button>
            <Button variant="outline" onClick={() => handlePlatformShare("x")} className="w-full justify-start">
              <TbBrandX />
              Share to X
            </Button>
            <Button variant="outline" onClick={() => handlePlatformShare("copy")} className="w-full justify-start">
              <LinkIcon size={16} />
              Copy Link
            </Button>
            <div className="flex gap-4 justify-end mt-2">
              <Button onClick={handleClose} variant="default">
                View Post
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
