"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ShoppingBag, DollarSign, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { TipDialog } from "./tip-dialog";
import { Input } from "@/components/ui/input";
import { Post } from "@lens-protocol/client";

interface TipPopoverProps {
  children: React.ReactNode;
  onCollectClick: () => void;
  post: Post;
}

export const TipPopover = ({ children, onCollectClick, post }: TipPopoverProps) => {
  const [tipDialogOpen, setTipDialogOpen] = useState(false);
  const [selectedTipAmount, setSelectedTipAmount] = useState<string | null>(null);
  const [isCustomTipInput, setIsCustomTipInput] = useState(false);
  const [customTipAmount, setCustomTipAmount] = useState<string>("");

  const handleTipButtonClick = (amount: string) => {
    setSelectedTipAmount(amount);
    setIsCustomTipInput(false);
  };

  const handleCustomTipClick = () => {
    setSelectedTipAmount(null);
    setIsCustomTipInput(true);
  };

  const handleSendTip = () => {
    let finalAmount = "0";

    if (isCustomTipInput && customTipAmount && parseFloat(customTipAmount) > 0) {
      finalAmount = customTipAmount;
    } else if (selectedTipAmount) {
      finalAmount = selectedTipAmount;
    } else {
      // No amount selected or entered
      return;
    }

    setTipDialogOpen(true);
    setSelectedTipAmount(finalAmount);
  };

  const handleBackToOptions = () => {
    setIsCustomTipInput(false);
    setCustomTipAmount("");
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numeric values with up to 2 decimal places
    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
      setCustomTipAmount(value);
    }
  };

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>{children}</PopoverTrigger>
        <PopoverContent side="top" sideOffset={10} className="max-w-md bg-background p-4">
          <div className="flex flex-col items-center gap-3">
            <Button
              variant="default"
              className="w-full flex items-center gap-2"
              onClick={() => {
                onCollectClick();
              }}
            >
              <ShoppingBag className="h-4 w-4" />
              Collect Post
            </Button>

            <div className="flex items-center w-full gap-2">
              <div className="h-px flex-1 bg-border"></div>
              <p className="text-sm text-muted-foreground">Or tip the author</p>
              <div className="h-px flex-1 bg-border"></div>
            </div>

            {isCustomTipInput ? (
              <div className="w-full flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10"
                  onClick={handleBackToOptions}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                  </span>
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={customTipAmount}
                    onChange={handleCustomAmountChange}
                    placeholder="0.00"
                    className="pl-9"
                    autoFocus
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2 w-full">
                <Button
                  variant={selectedTipAmount === "2" ? "default" : "outline"}
                  onClick={() => handleTipButtonClick("2")}
                  className="w-full"
                >
                  <DollarSign className="h-3 w-3 -mr-1" />2
                </Button>
                <Button
                  variant={selectedTipAmount === "5" ? "default" : "outline"}
                  onClick={() => handleTipButtonClick("5")}
                  className="w-full"
                >
                  <DollarSign className="h-3 w-3 -mr-1" />5
                </Button>
                <Button
                  variant={selectedTipAmount === "10" ? "default" : "outline"}
                  onClick={() => handleTipButtonClick("10")}
                  className="w-full"
                >
                  <DollarSign className="h-3 w-3 -mr-1" />10
                </Button>
                <Button
                  variant={isCustomTipInput ? "default" : "outline"}
                  onClick={handleCustomTipClick}
                  className="w-full"
                >
                  Other
                </Button>
              </div>
            )}

            <Button
              variant="default"
              className="w-full"
              disabled={!(selectedTipAmount || (isCustomTipInput && customTipAmount && parseFloat(customTipAmount) > 0))}
              onClick={handleSendTip}
            >
              Send Tip
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <TipDialog
        post={post}
        isOpen={tipDialogOpen}
        onOpenChange={setTipDialogOpen}
        tipAmount={selectedTipAmount || "0"}
      />
    </>
  );
}; 