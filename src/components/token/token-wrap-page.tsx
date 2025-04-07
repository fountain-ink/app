"use client";

import { TokenWrapDialog } from "@/components/token/token-wrap-dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAccount, useBalance, useWalletClient } from "wagmi";
import { ConnectWalletButton } from "@/components/auth/auth-wallet-button";
import { ArrowRight, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface TokenWrapClientPageProps {
  accountAddress?: string;
  tokenAddress: string;
}

export function TokenWrap({ accountAddress, tokenAddress }: TokenWrapClientPageProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferAmount, setTransferAmount] = useState<string>("");
  const { address: walletAddress, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  console.log("accountAddress", accountAddress);
  console.log("walletAddress", walletAddress);

  const { data: walletGhoBalance, isLoading: isWalletGhoBalanceLoading } = useBalance({
    address: walletAddress || "0x0000000000000000000000000000000000000000",
  });

  const { data: walletWrappedGhoBalance, isLoading: isWalletWrappedGhoBalanceLoading } = useBalance({
    address: walletAddress || "0x0000000000000000000000000000000000000000",
    token: tokenAddress as `0x${string}`,
  });

  const { data: accountGhoBalance, isLoading: isAccountGhoBalanceLoading } = useBalance({
    address: (accountAddress as `0x${string}`) || "0x0000000000000000000000000000000000000000",
  });

  const { data: accountWrappedGhoBalance, isLoading: isAccountWrappedGhoBalanceLoading } = useBalance({
    address: (accountAddress as `0x${string}`) || "0x0000000000000000000000000000000000000000",
    token: tokenAddress as `0x${string}`,
  });

  const hasLensAccount = !!accountAddress;

  const handleTransferToAccount = async () => {
    if (!walletClient || !walletAddress || !accountAddress) {
      toast.error("Wallet or account not connected");
      return;
    }

    try {
      setIsTransferring(true);

      // Create transfer transaction
      await walletClient.sendTransaction({
        to: accountAddress as `0x${string}`,
        value: BigInt(Number.parseFloat(transferAmount || "0") * 10 ** 18),
      });

      toast.success(`Successfully sent ${transferAmount} GHO to your Lens account`);
      setTransferAmount("");
    } catch (error) {
      console.error("Error transferring tokens:", error);
      toast.error("Failed to send tokens to your account", {
        description: (error as Error).message,
      });
    } finally {
      setIsTransferring(false);
    }
  };

  const truncateAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const showWalletData = walletAddress && isConnected;
  const showAccountData = accountAddress && hasLensAccount;

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="max-w-lg w-full p-4 py-8">
        {isConnected ? (
          hasLensAccount ? (
            <div className="space-y-6">
              {/* Wallet Balances */}
              <div className="bg-muted/30 rounded-lg p-6 space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-semibold">Wallet Balances</h2>
                  <div className="text-xs text-muted-foreground bg-muted/50 rounded-md px-2 py-1 border border-border max-w-[120px] truncate" title={walletAddress || ""}>
                    {truncateAddress(walletAddress || "")}
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="bg-background p-4 rounded-md border border-border">
                    <div className="text-sm text-muted-foreground mb-1">Native GHO</div>
                    <div className="font-medium">
                      {!showWalletData
                        ? "0"
                        : isWalletGhoBalanceLoading
                          ? "Loading..."
                          : walletGhoBalance
                            ? walletGhoBalance.formatted
                            : "0"}
                    </div>
                  </div>
                  <div className="bg-background p-4 rounded-md border border-border">
                    <div className="text-sm text-muted-foreground mb-1">Wrapped GHO</div>
                    <div className="font-medium">
                      {!showWalletData
                        ? "0"
                        : isWalletWrappedGhoBalanceLoading
                          ? "Loading..."
                          : walletWrappedGhoBalance
                            ? walletWrappedGhoBalance.formatted
                            : "0"}
                    </div>
                  </div>
                </div>

                {/* Transfer from wallet to account section */}
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="text-sm font-medium mb-2">Transfer GHO to your Lens account</div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Amount"
                      value={transferAmount}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "" || /^\d*\.?\d*$/.test(value)) {
                          setTransferAmount(value);
                        }
                      }}
                      className="flex-1 px-3 py-1 rounded-md border border-border bg-background text-sm"
                    />
                    <Button
                      size="sm"
                      onClick={handleTransferToAccount}
                      disabled={isTransferring || !transferAmount || Number.parseFloat(transferAmount) <= 0}
                      className="flex items-center gap-1"
                    >
                      {isTransferring ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <ArrowRight className="h-4 w-4" />
                      )}
                      Send
                    </Button>
                  </div>
                </div>
              </div>

              {/* Account Balances */}
              <div className="bg-muted/30 rounded-lg p-6 space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-semibold">Lens Account Balances</h2>
                  <div className="text-xs text-muted-foreground bg-muted/50 rounded-md px-2 py-1 border border-border max-w-[120px] truncate" title={accountAddress || ""}>
                    {truncateAddress(accountAddress || "")}
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="bg-background p-4 rounded-md border border-border">
                    <div className="text-sm text-muted-foreground mb-1">Native GHO</div>
                    <div className="font-medium">
                      {!showAccountData
                        ? "0"
                        : isAccountGhoBalanceLoading
                          ? "Loading..."
                          : accountGhoBalance
                            ? accountGhoBalance.formatted
                            : "0"}
                    </div>
                  </div>
                  <div className="bg-background p-4 rounded-md border border-border">
                    <div className="text-sm text-muted-foreground mb-1">Wrapped GHO</div>
                    <div className="font-medium">
                      {!showAccountData
                        ? "0"
                        : isAccountWrappedGhoBalanceLoading
                          ? "Loading..."
                          : accountWrappedGhoBalance
                            ? accountWrappedGhoBalance.formatted
                            : "0"}
                    </div>
                  </div>
                </div>

                <Button onClick={() => setIsDialogOpen(true)} className="w-full mt-4" size="lg">
                  Wrap/Unwrap
                </Button>
              </div>

              <div className="bg-muted/30 rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-3">Send Tokens</h2>
                <p className="text-sm text-muted-foreground mb-3">
                  Need to send wGHO tokens to someone? Visit our send page to transfer your wrapped tokens to any address.
                </p>
                <Link href="/send">
                  <Button variant="outline" className="w-full">Go to Send Tokens</Button>
                </Link>
              </div>

              <div className="bg-muted/30 rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-3">About Token Wrapping</h2>
                <p className="text-sm text-muted-foreground mb-3">
                  Wrapping your tokens allows them to be used within the ecosystem. When you wrap a token, it gets
                  converted to an ERC-20 compatible version of itself.
                </p>
                <p className="text-sm text-muted-foreground">
                  You can unwrap tokens at any time to convert them back to their original form.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-muted/30 rounded-lg p-8 text-center space-y-4">
              <p className="mb-4">
                No Lens account found. Please create or connect a Lens account to wrap/unwrap tokens.
              </p>
            </div>
          )
        ) : (
          <div className="bg-muted/30 rounded-lg p-8 text-center space-y-4">
            <p className="mb-4">Connect your wallet to wrap/unwrap tokens</p>
            <div className="flex justify-center">
              <ConnectWalletButton text="Connect Wallet" />
            </div>
          </div>
        )}
      </div>

      {accountAddress && (
        <TokenWrapDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} accountAddress={accountAddress} />
      )}
    </div>
  );
}
