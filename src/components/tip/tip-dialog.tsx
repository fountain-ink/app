"use client";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { Post, postId, evmAddress } from "@lens-protocol/client";
import { executePostAction } from "@lens-protocol/client/actions";
import { handleOperationWith } from "@lens-protocol/client/viem";
import { UserAvatar } from "@/components/user/user-avatar";
import { UserName } from "@/components/user/user-name";
import { UserUsername } from "@/components/user/user-handle";
import { Button } from "@/components/ui/button";
import { CoinsIcon } from "lucide-react";
import { useWalletClient, useBalance } from "wagmi";
import { useState } from "react";
import { getLensClient } from "@/lib/lens/client";
import { toast } from "sonner";
import { useAccount, useAuthenticatedUser } from "@lens-protocol/react";

const DEFAULT_CURRENCY = "0xeee5a340Cdc9c179Db25dea45AcfD5FE8d4d3eB8"; // WGHO Token

interface TipDialogProps {
  post: Post;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  tipAmount: string;
  currencyAddress?: string;
}

const formatDisplayAmount = (amount: string): string => {
  const numAmount = parseFloat(amount);
  return numAmount % 1 === 0 ? numAmount.toString() : numAmount.toFixed(2);
};

export const TipDialog = ({
  post,
  isOpen,
  onOpenChange,
  tipAmount,
  currencyAddress = DEFAULT_CURRENCY
}: TipDialogProps) => {
  const { data: walletClient } = useWalletClient();
  const [isTipping, setIsTipping] = useState(false);
  const { data: authenticatedUser } = useAuthenticatedUser();

  const { data: tokenBalance, isLoading: isBalanceLoading } = useBalance({
    token: currencyAddress as `0x${string}`,
    address: authenticatedUser?.address,
  });

  const hasEnoughBalance = tokenBalance ?
    parseFloat(tokenBalance.formatted) >= parseFloat(tipAmount) :
    false;

  const formattedTipAmount = formatDisplayAmount(tipAmount);

  const handleTip = async () => {
    if (!walletClient) {
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

      const result = await executePostAction(lens, {
        post: postId(post.id),
        action: {
          tipping: {
            currency: evmAddress(currencyAddress),
            value: tipAmount,
          },
        },
      }).andThen(handleOperationWith(walletClient as any));

      if (result.isErr()) {
        console.error(result.error);
        toast.error("Failed to tip post");
        setIsTipping(false);
        return;
      }

      toast.success("Tip sent successfully!", {
        description: `Sent ${formattedTipAmount} ${tokenBalance?.symbol || "tokens"} to the author of this post`,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error tipping post:", error);
      toast.error("An error occurred while tipping the post", {
        description: error as string,
      });
    } finally {
      setIsTipping(false);
    }
  };

  return (
    <Dialog modal={true} open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md gap-4">
        <DialogHeader className="p-0 space-y-0">
          <DialogTitle className="absolute -left-[9999px]">Tip Post</DialogTitle>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Tip</h2>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="flex flex-row items-center gap-2">
              <UserAvatar account={post.author} className="w-12 h-12" />
              <div className="flex flex-col">
                <UserName className="text-base" profile={post.author} />
                <UserUsername account={post.author} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 bg-muted/30 rounded-xl p-6">
          <CoinsIcon className="h-12 w-12 text-primary" />
          <h3 className="text-xl font-medium">
            Tip ${formattedTipAmount} {tokenBalance?.symbol || "tokens"}
          </h3>
          <p className="text-center text-muted-foreground">
            You are about to send a tip to the author of this post.
          </p>
        </div>

        <div className="flex flex-col gap-2 mt-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Your balance</span>
            <span className="font-medium">
              {isBalanceLoading
                ? "Loading..."
                : tokenBalance
                  ? `${tokenBalance.formatted} ${tokenBalance.symbol}`
                  : "Unknown"
              }
            </span>
          </div>
          {!hasEnoughBalance && tokenBalance && (
            <p className="text-sm text-destructive">
              Insufficient balance to complete this tip
            </p>
          )}
        </div>

        <Button
          disabled={!hasEnoughBalance || isTipping}
          onClick={handleTip}
          className="w-full"
          size="lg"
        >
          {isTipping
            ? "Processing..."
            : hasEnoughBalance
              ? `Send $${formattedTipAmount} ${tokenBalance?.symbol || "tokens"}`
              : "Insufficient balance"
          }
        </Button>
      </DialogContent>
    </Dialog>
  );
}; 