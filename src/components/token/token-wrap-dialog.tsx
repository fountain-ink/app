"use client";

import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogClose } from "@/components/ui/dialog";
import { wrapTokens, unwrapTokens } from "@lens-protocol/client/actions";
import { handleOperationWith } from "@lens-protocol/client/viem";
import { bigDecimal } from "@lens-protocol/client";
import { Button } from "@/components/ui/button";
import { Info, ArrowDownUp, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWalletClient, useBalance } from "wagmi";
import { useState, useEffect } from "react";
import { getLensClient } from "@/lib/lens/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const WRAPPED_GHO_TOKEN_ADDRESS = "0x6bDc36E20D267Ff0dd6097799f82e78907105e2F";

interface TokenWrapProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  accountAddress: string;
}

export const TokenWrapDialog = ({ isOpen, onOpenChange, accountAddress }: TokenWrapProps) => {
  const { data: walletClient } = useWalletClient();
  const [isProcessing, setIsProcessing] = useState(false);
  const [amount, setAmount] = useState<string>("");
  const [mode, setMode] = useState<"wrap" | "unwrap">("wrap");

  const { data: ghoBalance, isLoading: isGhoBalanceLoading } = useBalance({
    address: accountAddress as `0x${string}`,
  });

  const { data: wrappedGhoBalance, isLoading: isWrappedGhoBalanceLoading } = useBalance({
    address: accountAddress as `0x${string}`,
    token: WRAPPED_GHO_TOKEN_ADDRESS as `0x${string}`,
  });

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const toggleMode = () => {
    setMode(mode === "wrap" ? "unwrap" : "wrap");
    setAmount("");
  };

  const handleWrapTokens = async () => {
    if (!walletClient || !amount || Number.parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      setIsProcessing(true);
      const lens = await getLensClient();

      if (!lens.isSessionClient()) {
        toast.error("You need to be logged in to wrap tokens");
        setIsProcessing(false);
        return;
      }

      const decimalAmount = bigDecimal(Number.parseFloat(amount));

      const result = await wrapTokens(lens, {
        amount: decimalAmount,
      }).andThen(handleOperationWith(walletClient as any));

      if (result.isErr()) {
        console.error(result.error);
        toast.error("Failed to wrap tokens");
        setIsProcessing(false);
        return;
      }

      toast.success(`Successfully wrapped ${amount} GHO`);
      setAmount("");
      onOpenChange(false);
    } catch (error) {
      console.error("Error wrapping tokens:", error);
      toast.error("An error occurred while wrapping tokens", {
        description: error as string,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnwrapTokens = async () => {
    if (!walletClient || !amount || Number.parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      setIsProcessing(true);
      const lens = await getLensClient();

      if (!lens.isSessionClient()) {
        toast.error("You need to be logged in to unwrap tokens");
        setIsProcessing(false);
        return;
      }

      const decimalAmount = bigDecimal(Number.parseFloat(amount));

      const result = await unwrapTokens(lens, {
        amount: decimalAmount,
      }).andThen(handleOperationWith(walletClient as any));

      if (result.isErr()) {
        console.error(result.error);
        toast.error("Failed to unwrap tokens");
        setIsProcessing(false);
        return;
      }

      toast.success(`Successfully unwrapped ${amount} GHO`);
      setAmount("");
      onOpenChange(false);
    } catch (error) {
      console.error("Error unwrapping tokens:", error);
      toast.error("An error occurred while unwrapping tokens", {
        description: error as string,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = () => {
    if (mode === "wrap") {
      handleWrapTokens();
    } else {
      handleUnwrapTokens();
    }
  };

  const handleSetMaxAmount = () => {
    if (mode === "wrap" && ghoBalance) {
      setAmount(ghoBalance.formatted);
    } else if (mode === "unwrap" && wrappedGhoBalance) {
      setAmount(wrappedGhoBalance.formatted);
    }
  };

  return (
    <Dialog modal={true} open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md gap-4">
        <DialogHeader className="p-0 space-y-0">
          <DialogTitle className="text-xl font-semibold">
            {mode === "wrap" ? "Wrap GHO" : "Unwrap GHO"} on Lens Account
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <Button variant="outline" size="sm" onClick={toggleMode} className="flex items-center gap-1">
              <ArrowDownUp size={16} />
              {mode === "wrap" ? "Switch to Unwrap" : "Switch to Wrap"}
            </Button>
          </div>

          <div className="bg-blue-500/10 text-blue-700 dark:text-blue-300 p-3 rounded-lg text-sm flex items-start gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              This will {mode === "wrap" ? "wrap" : "unwrap"} tokens directly on your Lens account (
              {accountAddress.slice(0, 6)}...{accountAddress.slice(-4)}).
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="amount" className="text-sm font-medium">
                Amount to {mode}
              </Label>
              <div className="text-xs text-muted-foreground">
                Lens Account Balance:{" "}
                {mode === "wrap"
                  ? isGhoBalanceLoading
                    ? "Loading..."
                    : ghoBalance
                      ? `${ghoBalance.formatted} GHO`
                      : "0 GHO"
                  : isWrappedGhoBalanceLoading
                    ? "Loading..."
                    : wrappedGhoBalance
                      ? `${wrappedGhoBalance.formatted} wGHO`
                      : "0 wGHO"}
                <Button
                  variant="ghost"
                  size="xs"
                  className="ml-2 h-5 px-1 text-xs text-primary"
                  onClick={handleSetMaxAmount}
                >
                  MAX
                </Button>
              </div>
            </div>
            <Input
              id="amount"
              type="text"
              value={amount}
              onChange={handleAmountChange}
              placeholder="0.00"
              className="w-full"
            />
          </div>

          <Button
            disabled={!amount || Number.parseFloat(amount) <= 0 || isProcessing}
            onClick={handleSubmit}
            className="w-full"
            size="lg"
          >
            {isProcessing
              ? `${mode === "wrap" ? "Wrapping" : "Unwrapping"}...`
              : `${mode === "wrap" ? "Wrap" : "Unwrap"} ${amount ? amount : "0"} GHO on Lens Account`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
