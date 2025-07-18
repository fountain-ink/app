"use client";

import { bigDecimal, Post, postId } from "@lens-protocol/client";
import { executePostAction } from "@lens-protocol/client/actions";
import { handleOperationWith } from "@lens-protocol/client/viem";
import { useAuthenticatedUser } from "@lens-protocol/react";
import { ArrowLeft, DollarSign, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { formatUnits } from "viem";
import { useBalance, useWalletClient } from "wagmi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useReconnectWallet } from "@/hooks/use-reconnect-wallet";
import { getLensClient } from "@/lib/lens/client";

const DEFAULT_CURRENCY = "0x6bDc36E20D267Ff0dd6097799f82e78907105e2F"; // WGHO

const TIP_AMOUNTS = ["0.1", "1", "10"] as const;

interface TipPopoverProps {
  children: React.ReactNode;
  onCollectClick: () => void;
  post: Post;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const formatDisplayAmount = (amount: string): string => {
  const numAmount = Number.parseFloat(amount);
  return numAmount % 1 === 0 ? numAmount.toString() : numAmount.toFixed(2);
};

const formatBalanceDisplay = (value?: bigint, decimals?: number): string => {
  if (!value || decimals === undefined) return "0";
  const formatted = formatUnits(value, decimals);
  const numValue = Number.parseFloat(formatted);
  return numValue.toFixed(2);
};

export const TipPopover = ({ children, onCollectClick, post, open: controlledOpen, onOpenChange }: TipPopoverProps) => {
  const [selectedTipAmount, setSelectedTipAmount] = useState<string | null>(TIP_AMOUNTS[0]);
  const [isCustomTipInput, setIsCustomTipInput] = useState(false);
  const [customTipAmount, setCustomTipAmount] = useState<string>("");
  const [isTipping, setIsTipping] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);
  const { data: walletClient } = useWalletClient();
  const reconnectWallet = useReconnectWallet();
  const { data: authenticatedUser } = useAuthenticatedUser();
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const { data: ghoBalance, isLoading: isGhoBalanceLoading } = useBalance({
    address: authenticatedUser?.address as `0x${string}`,
  });

  const tokenBalance = ghoBalance ? formatBalanceDisplay(ghoBalance.value, ghoBalance.decimals) : "0";
  const tokenSymbol = ghoBalance?.symbol;

  const handleTipButtonClick = (amount: string) => {
    setSelectedTipAmount(amount);
    setIsCustomTipInput(false);
  };

  const handleCustomTipClick = () => {
    setSelectedTipAmount(null);
    setIsCustomTipInput(true);
  };

  const handleSendTip = async () => {
    let finalAmount = "0";

    if (isCustomTipInput && customTipAmount && Number.parseFloat(customTipAmount) > 0) {
      finalAmount = customTipAmount;
    } else if (selectedTipAmount) {
      finalAmount = selectedTipAmount;
    } else {
      // No amount selected or entered
      return;
    }

    const hasEnoughBalance = tokenBalance ? Number.parseFloat(tokenBalance) >= Number.parseFloat(finalAmount) : false;

    if (!walletClient) {
      reconnectWallet();
      toast.error("Wallet not connected");
      return;
    }

    if (!hasEnoughBalance) {
      toast.error("Insufficient balance");
      return;
    }

    try {
      setIsTipping(true);
      const lens = await getLensClient();

      if (!lens.isSessionClient()) {
        toast.error("You need to be logged in to tip this post");
        setIsTipping(false);
        return;
      }

      const formattedTipAmount = formatDisplayAmount(finalAmount);

      const toastId = toast.loading(`Sending $${formattedTipAmount} tip...`);

      executePostAction(lens, {
        post: postId(post.id),
        action: {
          tipping: {
            native: bigDecimal(finalAmount),
          },
        },
      })
        .andThen(handleOperationWith(walletClient))
        .andTee((txHash) => {
          console.log("Tip transaction mined:", txHash);
          toast.success(`Tipped $${formattedTipAmount} to @${post.author.username?.localName}!`, { id: toastId });
          handleOpenChange(false);
          setIsTipping(false);
        })
        .andThen(lens.waitForTransaction)
        .match(
          (txData) => {
            console.log("Tip transaction indexed:", txData);
          },
          (error) => {
            console.error("Tip transaction failed:", error);
            toast.error("Transaction failed on-chain", { id: toastId });
          },
        );
    } catch (error) {
      console.error("Error tipping post:", error);
      toast.error("An error occurred while tipping the post");
      setIsTipping(false);
    }
  };

  const handleBackToOptions = () => {
    setIsCustomTipInput(false);
    setCustomTipAmount("");
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
      setCustomTipAmount(value);
    }
  };

  const hasCollectAction = !(
    post.operations?.canSimpleCollect.__typename === "SimpleCollectValidationFailed" &&
    post.operations?.canSimpleCollect.reasonType === "NOT_ENABLED"
  );
  const canCollect = post.operations?.canSimpleCollect.__typename === "SimpleCollectValidationPassed";

  const getFinalTipAmount = () => {
    if (isCustomTipInput && customTipAmount && Number.parseFloat(customTipAmount) > 0) {
      return customTipAmount;
    }
    if (selectedTipAmount) {
      return selectedTipAmount;
    }
    return "0";
  };

  const finalTipAmount = getFinalTipAmount();
  const hasEnoughBalance = tokenBalance ? Number.parseFloat(tokenBalance) >= Number.parseFloat(finalTipAmount) : false;

  const handleOpenChange = (newOpen: boolean) => {
    if (controlledOpen === undefined) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-80 p-4 pb-3" sideOffset={8} align="center" side="top">
        <div className="flex flex-col items-center gap-3">
          {hasCollectAction && (
            <>
              <Button
                variant="default"
                className="w-full flex items-center gap-2"
                disabled={!canCollect}
                onClick={() => {
                  onCollectClick();
                }}
              >
                <ShoppingBag className="h-4 w-4" />
                Collect Post
              </Button>

              <div className="flex items-center w-full gap-2">
                <div className="h-px flex-1 bg-border" />
                <span className="text-sm text-muted-foreground">Or tip the author</span>
                <div className="h-px flex-1 bg-border" />
              </div>
            </>
          )}

          {isCustomTipInput ? (
            <div className="w-full flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-10 w-10" onClick={handleBackToOptions}>
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
              {TIP_AMOUNTS.map((amount) => (
                <Button
                  key={amount}
                  variant={selectedTipAmount === amount ? "default" : "outline"}
                  onClick={() => handleTipButtonClick(amount)}
                  className="w-full"
                >
                  <DollarSign className="h-3 w-3 -mr-2 text-muted-foreground" />
                  {amount}
                </Button>
              ))}
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
            disabled={isTipping || !hasEnoughBalance || !(finalTipAmount !== "0")}
            onClick={handleSendTip}
          >
            {isTipping
              ? "Confirming..."
              : !hasEnoughBalance && finalTipAmount !== "0"
                ? "Insufficient balance"
                : hasCollectAction
                  ? "Send Tip"
                  : "Tip the author"}
          </Button>

          {isGhoBalanceLoading ? null : (
            <div className="text-xs text-muted-foreground w-full text-center -mt-2">
              Account balance: ${tokenBalance}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
