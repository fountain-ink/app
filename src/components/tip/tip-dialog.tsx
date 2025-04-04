"use client";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { Post, postId, evmAddress, testnet } from "@lens-protocol/client";
import { executePostAction } from "@lens-protocol/client/actions";
import { handleOperationWith } from "@lens-protocol/client/viem";
import { UserAvatar } from "@/components/user/user-avatar";
import { UserName } from "@/components/user/user-name";
import { UserUsername } from "@/components/user/user-handle";
import { Button } from "@/components/ui/button";
import { CoinsIcon } from "lucide-react";
import { useWalletClient, useBalance, useReadContract, useReadContracts } from "wagmi";
import { useState } from "react";
import { getLensClient } from "@/lib/lens/client";
import { toast } from "sonner";
import { useAccount, useAuthenticatedUser } from "@lens-protocol/react";
import { chains } from "@lens-chain/sdk/viem";
import { erc20Abi } from "viem";

const DEFAULT_CURRENCY = "0x6bDc36E20D267Ff0dd6097799f82e78907105e2F"; // WGHO

interface TipDialogProps {
  post: Post;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  tipAmount: string;
  currencyAddress?: string;
}

const formatDisplayAmount = (amount: string): string => {
  const numAmount = Number.parseFloat(amount);
  return numAmount % 1 === 0 ? numAmount.toString() : numAmount.toFixed(2);
};

export const TipDialog = ({
  post,
  isOpen,
  onOpenChange,
  tipAmount,
  currencyAddress = DEFAULT_CURRENCY,
}: TipDialogProps) => {
  const { data: walletClient } = useWalletClient();
  const [isTipping, setIsTipping] = useState(false);
  const { data: authenticatedUser } = useAuthenticatedUser();

  const { data, isLoading: isBalanceLoading } = useReadContracts({
    allowFailure: false,
    contracts: [
      {
        address: currencyAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [authenticatedUser?.address as `0x${string}`],
      },
      {
        address: currencyAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: "decimals",
      },
      {
        address: currencyAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: "symbol",
      },
    ],
  });
  const tokenBalance = data?.[0];
  const tokenDecimals = data?.[1];
  const tokenSymbol = data?.[2];
  console.log(tokenBalance, tokenDecimals, tokenSymbol, isBalanceLoading, authenticatedUser?.address, currencyAddress);

  const hasEnoughBalance = tokenBalance
    ? Number.parseFloat(tokenBalance.toString()) >= Number.parseFloat(tipAmount)
    : false;

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
        description: `Sent ${formattedTipAmount} ${tokenSymbol || "tokens"} to the author of this post`,
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
            Tip ${formattedTipAmount} {tokenSymbol || "tokens"}
          </h3>
          <p className="text-center text-muted-foreground">You are about to send a tip to the author of this post.</p>
        </div>

        <div className="flex flex-col gap-2 mt-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Your balance</span>
            <span className="font-medium">
              {isBalanceLoading ? "Loading..." : tokenBalance ? `${tokenBalance.toString()} ${tokenSymbol}` : "Unknown"}
            </span>
          </div>
          {!hasEnoughBalance && tokenBalance && (
            <p className="text-sm text-destructive">Insufficient balance to complete this tip</p>
          )}
        </div>

        <Button disabled={!hasEnoughBalance || isTipping} onClick={handleTip} className="w-full" size="lg">
          {isTipping
            ? "Processing..."
            : hasEnoughBalance
              ? `Send $${formattedTipAmount} ${tokenSymbol || "tokens"}`
              : "Insufficient balance"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
