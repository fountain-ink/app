import html2canvas from "html2canvas";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

type FeedbackType = "bug" | "feature" | "other";

export function FeedbackForm() {
  const [feedbackType, setFeedbackType] = useState<FeedbackType | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [includeScreenshot, setIncludeScreenshot] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: feedbackType,
          text: feedbackText.trim(),
          screenshot,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit feedback");

      toast.success("Thank you for your feedback!", { description: "We'll review it as soon as possible." });
      setFeedbackType(null);
      setFeedbackText("");
    } catch {
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setIsDropdownOpen(false);
      setIsSubmitting(false);
    }
  };

  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button className="shrink-0" variant="outline">
          Feedback
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent className="w-fit">
          {!feedbackType ? (
            <div className="flex flex-col gap-2 p-1">
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  handleTypeSelect("bug");
                }}
              >
                Report a Bug
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  handleTypeSelect("feature");
                }}
              >
                Request a Feature
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  handleTypeSelect("other");
                }}
              >
                Other Feedback
              </DropdownMenuItem>
            </div>
          ) : (
            <div className="flex flex-col gap-4 p-4">
              <Textarea
                placeholder="Please describe your feedback..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="min-h-[100px] min-w-[400px] p-2"
              />
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="screenshot"
                  checked={includeScreenshot}
                  onCheckedChange={(checked) => setIncludeScreenshot(checked as boolean)}
                />
                <Label htmlFor="screenshot">Include screenshot</Label>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSubmit} disabled={!feedbackText.trim() || isSubmitting} size="sm">
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
