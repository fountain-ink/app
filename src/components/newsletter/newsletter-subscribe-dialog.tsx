"use client";

import { AlertCircle, MailCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { subscribeToNewsletter } from "@/lib/listmonk/newsletter";
import { BlogData } from "@/lib/settings/get-blog-data";

interface BlogSubscribeProps {
  blogData: BlogData;
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function BlogEmailSubscribe({
  blogData,
  variant = "outline",
  size = "default",
  className = "",
  open,
  onOpenChange,
}: BlogSubscribeProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(open || false);
  const [email, setEmail] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [needsListCreation, setNeedsListCreation] = useState(false);

  useEffect(() => {
    if (searchParams.get("subscribe") === "" || searchParams.get("subscribe") === "true") {
      setIsModalOpen(true);
    } else if (open !== undefined) {
      setIsModalOpen(open);
    }
  }, [open, searchParams]);

  const handleOpenChange = (newOpen: boolean) => {
    setIsModalOpen(newOpen);
    onOpenChange?.(newOpen);
    
    if (!newOpen && (searchParams.get("subscribe") === "" || searchParams.get("subscribe") === "true")) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("subscribe");
      const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
      router.replace(newUrl, { scroll: false });
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return email === "" || emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setIsEmailValid(validateEmail(newEmail));
  };

  const handleSubscribe = async () => {
    setShowValidation(true);

    if (!isEmailValid || !email || !blogData) return;

    try {
      setIsLoading(true);

      const result = await subscribeToNewsletter(blogData.address, email);

      if (result?.success) {
        setIsSuccess(true);
        toast.success("Successfully subscribed to the blog!");
        setEmail("");
        setShowValidation(false);
        setTimeout(() => {
          setIsSuccess(false);
          handleOpenChange(false);
        }, 2000);
      } else if (result?.needsListCreation) {
        setNeedsListCreation(true);
      } else {
        toast.error(result?.error || "Failed to subscribe. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!blogData || !blogData.mail_list_id) return null;

  return (
    <>
      {!open && (
        <Button variant={variant} size={size} onClick={() => handleOpenChange(true)} className={className}>
          Subscribe
        </Button>
      )}

      <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Subscribe to {blogData?.title || "this blog"}</DialogTitle>
            <DialogDescription>
              Enter your email address to receive updates when new content is published.
            </DialogDescription>
          </DialogHeader>

          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-6 space-y-4">
              <MailCheck className="h-12 w-12 text-primary" />
              <p className="text-center">Thank you for subscribing!</p>
            </div>
          ) : needsListCreation ? (
            <div className="flex flex-col items-center justify-center py-6 space-y-4">
              <AlertCircle className="h-12 w-12 text-amber-500" />
              <p className="text-center">This blog doesn't have a newsletter set up yet.</p>
              <p className="text-center text-sm text-muted-foreground">
                The blog owner needs to set up a newsletter before you can subscribe.
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Input
                    id="email"
                    placeholder="your@email.com"
                    className={`col-span-4 ${!isEmailValid && showValidation ? "border-destructive" : ""}`}
                    value={email}
                    onChange={handleEmailChange}
                    disabled={isLoading || !blogData}
                  />
                  {!isEmailValid && showValidation && (
                    <span className="text-sm text-destructive col-span-4">Please enter a valid email address</span>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSubscribe} disabled={isLoading || !blogData}>
                  {isLoading ? "Subscribing..." : "Subscribe"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
