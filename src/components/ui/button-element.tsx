"use client";

import { cn, withRef } from "@udecode/cn";
import { PlateElement, useEditorRef, useElement, useReadOnly, useSelected } from "@udecode/plate/react";
import { CheckIcon, Link2Icon, MailIcon, MousePointerClickIcon, TypeIcon, UserPlusIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useBlogData } from "@/contexts/blog-data-context";
import { subscribeToNewsletter } from "@/lib/listmonk/newsletter";
import { ButtonType, TButtonElement } from "../editor/plugins/button-plugin";
import { Button, buttonVariants } from "./button";
import { ElementPopover } from "./element-popover";
import { Input } from "./input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Separator } from "./separator";

export const ButtonElement = withRef<typeof PlateElement>(({ children, className, ...props }, ref) => {
  const editor = useEditorRef();
  const element = useElement<TButtonElement>();
  const readOnly = useReadOnly();
  const selected = useSelected();
  const popoverRef = useRef<HTMLDivElement>(null);
  let blogData: ReturnType<typeof useBlogData> | null = null;

  try {
    blogData = useBlogData();
  } catch {
    // Context not available in editor mode
  }

  const [editUrlValue, setEditUrlValue] = useState(element?.url ?? "");
  const [editTextValue, setEditTextValue] = useState(element?.buttonText ?? "");
  const [buttonType, setButtonType] = useState<ButtonType>(element?.buttonType ?? "normal");
  const [activeInput, setActiveInput] = useState<"text" | "url" | null>(null);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setEditUrlValue(element?.url ?? "");
  }, [element?.url]);

  useEffect(() => {
    setEditTextValue(element?.buttonText ?? "");
  }, [element?.buttonText]);

  useEffect(() => {
    setButtonType(element?.buttonType ?? "normal");
  }, [element?.buttonType]);

  useEffect(() => {
    if (!selected) {
      setActiveInput(null);
    }
  }, [selected]);

  const handleUrlSubmit = () => {
    if (element && editUrlValue !== element.url) {
      editor.tf.setNodes<TButtonElement>({ url: editUrlValue }, { at: element });
    }
  };

  const handleTextSubmit = () => {
    if (element && editTextValue !== element.buttonText) {
      editor.tf.setNodes<TButtonElement>({ text: editTextValue }, { at: element });
    }
  };

  const handleButtonTypeSelect = (newType: ButtonType) => {
    setButtonType(newType);
    if (element) {
      editor.tf.setNodes<TButtonElement>({ buttonType: newType }, { at: element });
    }
    setActiveInput(null);
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleNewsletterSubscribe = async () => {
    if (!email || !validateEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!blogData?.blogAddress) {
      toast.error("Newsletter subscription is not available");
      return;
    }

    setIsLoading(true);
    try {
      const result = await subscribeToNewsletter(blogData.blogAddress, email);

      if (result?.success) {
        toast.success("Successfully subscribed to the newsletter!");
        setEmail("");
      } else if (result?.needsListCreation) {
        toast.error("This blog doesn't have a newsletter set up yet");
      } else {
        toast.error(result?.error || "Failed to subscribe. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderButton = () => {
    switch (buttonType) {
      case "newsletter":
        return (
          <div className="w-full">
            <div className="flex gap-2 items-center justify-center">
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!readOnly || isLoading}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && readOnly) {
                    e.preventDefault();
                    e.stopPropagation();
                    handleNewsletterSubscribe();
                  }
                }}
                onClick={(e) => {
                  if (readOnly) {
                    e.stopPropagation();
                  }
                }}
              />
              <Button
                variant="default"
                size="default"
                disabled={!readOnly || isLoading || !blogData?.blogAddress}
                onClick={(e) => {
                  if (readOnly) {
                    e.stopPropagation();
                    handleNewsletterSubscribe();
                  }
                }}
              >
                {isLoading ? "Subscribing..." : "Subscribe"}
              </Button>
            </div>
          </div>
        );
      case "follow":
        return (
          <Button
            variant={readOnly ? "outline" : "default"}
            size="default"
            className="text-sm"
            disabled={!readOnly}
            onClick={(e) => {
              if (readOnly) {
                e.stopPropagation();
                toast.success("Follow functionality not implemented in preview");
              }
            }}
          >
            {readOnly ? "Following" : "Follow"}
          </Button>
        );
      case "normal":
      default:
        return element?.url ? (
          <a
            href={element.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "default", size: "lg" }), "no-underline text-base")}
            onClick={(e) => {
              if (!readOnly) {
                e.preventDefault();
              }
            }}
          >
            {readOnly ? element?.buttonText || "Click here" : editTextValue || element?.buttonText || "Click here"}
          </a>
        ) : (
          <Button variant="default" size="lg" className={cn("text-base", "opacity-50 cursor-not-allowed")} disabled>
            {readOnly ? element?.buttonText || "No link set" : editTextValue || element?.buttonText || "No link set"}
          </Button>
        );
    }
  };

  const editPopoverContent = (
    <>
      {activeInput === "text" ? (
        <div className="flex items-center gap-1">
          <Input
            type="text"
            value={editTextValue}
            onChange={(e) => setEditTextValue(e.target.value)}
            onBlur={() => {
              handleTextSubmit();
              setActiveInput(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleTextSubmit();
                setActiveInput(null);
              }
              if (e.key === "Escape") {
                e.preventDefault();
                setActiveInput(null);
              }
              e.stopPropagation();
            }}
            placeholder="Button text"
            className="border px-3 h-10 rounded-md text-sm bg-background text-foreground 
            focus:ring-1 focus:ring-ring min-w-[200px] sm:min-w-[250px] md:min-w-[300px] w-full"
            onClick={(e) => e.stopPropagation()}
            autoFocus
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              handleTextSubmit();
              setActiveInput(null);
            }}
          >
            <CheckIcon className="h-4 w-4" />
          </Button>
        </div>
      ) : activeInput === "url" ? (
        <div className="flex items-center gap-1">
          <Input
            type="text"
            value={editUrlValue}
            onChange={(e) => setEditUrlValue(e.target.value)}
            onBlur={() => {
              handleUrlSubmit();
              setActiveInput(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleUrlSubmit();
                setActiveInput(null);
              }
              if (e.key === "Escape") {
                e.preventDefault();
                setActiveInput(null);
              }
              e.stopPropagation();
            }}
            placeholder="Button URL"
            className="border px-3 h-10 rounded-md text-sm bg-background text-foreground 
            focus:ring-1 focus:ring-ring min-w-[200px] sm:min-w-[250px] md:min-w-[300px] w-full"
            onClick={(e) => e.stopPropagation()}
            autoFocus
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              handleUrlSubmit();
              setActiveInput(null);
            }}
          >
            <CheckIcon className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          <Select value={buttonType} onValueChange={(value) => handleButtonTypeSelect(value as ButtonType)}>
            <SelectTrigger className="h-10 w-[180px]" onClick={(e) => e.stopPropagation()}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal" className="cursor-pointer">
                <div className="flex items-center gap-2">
                  <MousePointerClickIcon className="h-4 w-4" />
                  <span>Normal Button</span>
                </div>
              </SelectItem>
              <SelectItem value="newsletter" className="cursor-pointer">
                <div className="flex items-center gap-2">
                  <MailIcon className="h-4 w-4" />
                  <span>Newsletter</span>
                </div>
              </SelectItem>
              <SelectItem value="follow" className="cursor-pointer">
                <div className="flex items-center gap-2">
                  <UserPlusIcon className="h-4 w-4" />
                  <span>Follow</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          {buttonType === "normal" && (
            <>
              <Separator orientation="vertical" className="mx-1 h-6 bg-border" />
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveInput("text");
                }}
                title="Edit button text"
              >
                <TypeIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveInput("url");
                }}
                title="Edit button URL"
              >
                <Link2Icon className="h-4 w-4" />
              </Button>
            </>
          )}
          <Separator orientation="vertical" className="mx-1 h-6 bg-border" />
        </div>
      )}
    </>
  );

  return (
    <ElementPopover
      ref={popoverRef}
      open={selected}
      showCaption={false}
      showWidth={false}
      sideOffset={20}
      content={editPopoverContent}
    >
      <PlateElement ref={ref} className={cn(className, "my-6")} {...props}>
        <div className="group relative m-0 w-full flex justify-center" contentEditable={false}>
          {!readOnly && buttonType === "normal" && !element?.url ? (
            <div className="flex flex-col relative overflow-hidden rounded-md aspect-[6/1] bg-muted/20 gap-2 p-4 items-center justify-center w-full">
              <div className="flex items-center gap-2">
                <Link2Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-base select-none text-muted-foreground">Add a button link</span>
              </div>
              <div className="placeholder-background" />
            </div>
          ) : (
            renderButton()
          )}
        </div>
        {children}
      </PlateElement>
    </ElementPopover>
  );
});
