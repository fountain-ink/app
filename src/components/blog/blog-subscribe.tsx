"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { MailCheck, MailIcon } from "lucide-react";
import { BlogData } from "@/lib/settings/get-blog-data";

interface BlogSubscribeProps {
  blogData: BlogData;
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function BlogSubscribe({ 
  blogData,
  variant = "outline", 
  size = "default",
  className = ""
}: BlogSubscribeProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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
      
      const response = await fetch(`/api/blogs/${blogData.address}/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        toast.success("Successfully subscribed to the blog!");
        setEmail("");
        setShowValidation(false);
        setTimeout(() => {
          setIsSuccess(false);
          setIsModalOpen(false);
        }, 2000);
      } else {
        toast.error(data.error || "Failed to subscribe. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsModalOpen(true)}
        className={className}
      >
        <MailIcon className="h-4 w-4 mr-2" />
        Subscribe
      </Button>
      
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
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