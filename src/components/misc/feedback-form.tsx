import html2canvas from "html2canvas";
import { useState } from "react";
import { toast } from "sonner";
import { BugIcon } from "../icons/bug";
import { LightBulbIcon } from "../icons/light-bulb";
import { MessageCircleIcon } from "../icons/message-circle";
import { AnimatedMenuItem } from "../navigation/animated-item";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuPortal, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Label } from "../ui/label";
import { TextareaAutosize } from "../ui/textarea";

type FeedbackType = "bug" | "feature" | "other";

export function FeedbackForm() {
  const [feedbackType, setFeedbackType] = useState<FeedbackType | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [includeScreenshot, setIncludeScreenshot] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setIsDropdownOpen(open);
    if (!open) {
      setFeedbackType(null);
    }
  };

  const captureScreenshot = async (): Promise<string | null> => {
    try {
      const canvas = await html2canvas(document.body);
      return canvas.toDataURL("image/jpeg", 0.8);
    } catch (error) {
      console.error("Screenshot capture failed:", error);
      return null;
    }
  };

  const handleTypeSelect = (type: FeedbackType) => {
    setFeedbackType(type);
  };

  const handleSubmit = async () => {
    if (!feedbackType || !feedbackText.trim()) return;

    setIsSubmitting(true);
    try {
      let screenshot = null;
      if (includeScreenshot) {
        screenshot = await captureScreenshot();
        if (!screenshot) {
          toast.error("Failed to capture screenshot");
          return;
        }
      }

      setFeedbackType(null);
      setFeedbackText("");
      setIsDropdownOpen(false);
      toast.success("Thank you for your feedback!", { description: "We'll review it as soon as possible." });

      fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: feedbackType,
          text: feedbackText.trim(),
          screenshot,
        }),
      }).catch(() => {
        toast.error("Failed to submit feedback, but we saved your message for retry");
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={handleOpenChange} modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="shrink-0">
          Feedback
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent align="end" className="w-48 min-w-48 data-[state=open]:w-auto">
          {!feedbackType ? (
            <div className="flex flex-col">
              <AnimatedMenuItem
                icon={BugIcon}
                onClick={(e: React.MouseEvent) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleTypeSelect("bug");
                }}
              >
                Bug Report
              </AnimatedMenuItem>
              <AnimatedMenuItem
                icon={LightBulbIcon}
                onClick={(e: React.MouseEvent) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleTypeSelect("feature");
                }}
              >
                Feature Request
              </AnimatedMenuItem>
              <AnimatedMenuItem
                icon={MessageCircleIcon}
                onClick={(e: React.MouseEvent) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleTypeSelect("other");
                }}
              >
                Other
              </AnimatedMenuItem>
            </div>
          ) : (
            <div className="flex flex-col gap-4 p-2">
              <TextareaAutosize
                placeholder="Please describe your feedback..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="min-w-[400px] p-2"
              />
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="screenshot"
                  checked={includeScreenshot}
                  onCheckedChange={(checked) => setIncludeScreenshot(checked as boolean)}
                />
                <Label htmlFor="screenshot">Include screenshot</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button onClick={handleSubmit} disabled={!feedbackText.trim() || isSubmitting} size="default">
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
              </div>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  );
}
