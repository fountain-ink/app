"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAccount, useBalance, useWalletClient, usePublicClient } from "wagmi";
import { ConnectWalletButton } from "@/components/auth/auth-wallet-button";
import { ArrowRight, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { parseEther, encodeFunctionData } from "viem";

// Minimal ABI for the lens account's executeTransaction function
// https://github.com/lens-protocol/lens-v3/blob/development/contracts/extensions/account/IAccount.sol#L49
const LENS_ACCOUNT_ABI = [
  {
    inputs: [
      { name: "target", type: "address" },
      { name: "value", type: "uint256" },
      { name: "data", type: "bytes" },
    ],
    name: "executeTransaction",
    outputs: [{ name: "", type: "bytes" }],
    stateMutability: "payable",
    type: "function",
  },
] as const;

// Minimal ABI for ERC20 token's transfer function
// https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol#L22
const ERC20_ABI = [
  {
    inputs: [
      { name: "recipient", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

interface TokenSendClientPageProps {
  accountAddress?: string;
  tokenAddress: string;
}

export function TokenSend({ accountAddress, tokenAddress }: TokenSendClientPageProps) {
  const [isTransferring, setIsTransferring] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [transferAmount, setTransferAmount] = useState<string>("");
  const [sendFrom, setSendFrom] = useState<"wallet" | "account">("wallet");
  const [tokenType, setTokenType] = useState<"native" | "wrapped">("native");
  const { address: walletAddress, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const { data: walletWrappedGhoBalance, isLoading: isWalletWrappedGhoBalanceLoading } = useBalance({
    address: walletAddress || "0x0000000000000000000000000000000000000000",
    token: tokenAddress as `0x${string}`,
  });

  const { data: accountWrappedGhoBalance, isLoading: isAccountWrappedGhoBalanceLoading } = useBalance({
    address: (accountAddress as `0x${string}`) || "0x0000000000000000000000000000000000000000",
    token: tokenAddress as `0x${string}`,
  });

  const { data: walletGhoBalance, isLoading: isWalletGhoBalanceLoading } = useBalance({
    address: walletAddress || "0x0000000000000000000000000000000000000000",
  });

  const { data: accountGhoBalance, isLoading: isAccountGhoBalanceLoading } = useBalance({
    address: (accountAddress as `0x${string}`) || "0x0000000000000000000000000000000000000000",
  });

  const hasLensAccount = !!accountAddress;

  const handleSendToken = async () => {
    if (!walletClient || !walletAddress || !recipientAddress || !publicClient) {
      toast.error("Wallet not connected or recipient address not provided");
      return;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(recipientAddress)) {
      toast.error("Invalid recipient address");
      return;
    }

    if (!transferAmount || Number.parseFloat(transferAmount) <= 0) {
      toast.error("Invalid transfer amount");
      return;
    }

    try {
      setIsTransferring(true);
      const amountInWei = parseEther(transferAmount);
      let txHash: `0x${string}` | undefined;

      if (tokenType === "native") {
        // Handle native GHO transfers
        if (sendFrom === "wallet") {
          // Direct transfer from wallet
          txHash = await walletClient.sendTransaction({
            to: recipientAddress as `0x${string}`,
            value: amountInWei,
          });

          toast.success("Transaction submitted", {
            description: `Sending ${transferAmount} GHO from your wallet to ${recipientAddress.slice(0, 6)}...${recipientAddress.slice(-4)}`,
          });
        } else if (sendFrom === "account" && accountAddress) {
          // Transfer via Lens account's executeTransaction
          const { request } = await publicClient.simulateContract({
            address: accountAddress as `0x${string}`,
            abi: LENS_ACCOUNT_ABI,
            functionName: "executeTransaction",
            args: [
              recipientAddress as `0x${string}`,
              amountInWei,
              "0x" as `0x${string}`, // Empty bytes for native transfers
            ],
            account: walletAddress,
          });

          txHash = await walletClient.writeContract(request);

          toast.success("Transaction submitted", {
            description: `Sending ${transferAmount} GHO from your Lens account to ${recipientAddress.slice(0, 6)}...${recipientAddress.slice(-4)}`,
          });
        }
      } else if (tokenType === "wrapped") {
        if (sendFrom === "wallet") {
          // Direct ERC20 transfer from wallet
          const { request } = await publicClient.simulateContract({
            address: tokenAddress as `0x${string}`,
            abi: ERC20_ABI,
            functionName: "transfer",
            args: [recipientAddress as `0x${string}`, amountInWei],
            account: walletAddress,
          });

          txHash = await walletClient.writeContract(request);

          toast.success("Transaction submitted", {
            description: `Sending ${transferAmount} wGHO from your wallet to ${recipientAddress.slice(0, 6)}...${recipientAddress.slice(-4)}`,
          });
        } else if (sendFrom === "account" && accountAddress) {
          // Transfer ERC20 via Lens account's executeTransaction

          // Encode the ERC20 transfer function call
          const transferCalldata = encodeFunctionData({
            abi: ERC20_ABI,
            functionName: "transfer",
            args: [recipientAddress as `0x${string}`, amountInWei],
          });

          // Simulate the Lens account's executeTransaction call
          const { request } = await publicClient.simulateContract({
            address: accountAddress as `0x${string}`,
            abi: LENS_ACCOUNT_ABI,
            functionName: "executeTransaction",
            args: [
              tokenAddress as `0x${string}`, // Target is the token contract
              0n, // No ETH value for ERC20 transfers
              transferCalldata as `0x${string}`, // The encoded ERC20 transfer call
            ],
            account: walletAddress,
          });

          txHash = await walletClient.writeContract(request);

          toast.success("Transaction submitted", {
            description: `Sending ${transferAmount} wGHO from your Lens account to ${recipientAddress.slice(0, 6)}...${recipientAddress.slice(-4)}`,
          });
        }
      }

      if (!txHash) {
        toast.error("Invalid send configuration");
        setIsTransferring(false);
        return;
      }

      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

      if (receipt.status === "success") {
        toast.success("Transfer successful!", {
          description: `${transferAmount} ${tokenType === "native" ? "GHO" : "wGHO"} has been sent successfully.`,
        });
        setTransferAmount("");
        setRecipientAddress("");
      } else {
        toast.error("Transfer failed", {
          description: "Transaction was processed but failed. Please check the transaction for details.",
        });
      }
    } catch (error) {
      console.error("Error sending tokens:", error);
      toast.error("Failed to send tokens", {
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
              <div className="bg-muted/30 rounded-lg p-6 space-y-4">
                <h2 className="text-xl font-semibold mb-4">Token Balances</h2>

                <div className="space-y-4">
                  <div className="bg-background p-4 rounded-md border border-border">
                    <div className="flex justify-between items-center mb-3">
                      <div className="font-medium">Wallet</div>
                      <div
                        className="text-xs text-muted-foreground bg-muted/50 rounded-md px-2 py-1 border border-border max-w-[120px] truncate"
                        title={walletAddress || ""}
                      >
                        {truncateAddress(walletAddress || "")}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-muted-foreground">Native GHO</div>
                        <div>
                          {!showWalletData
                            ? "0"
                            : isWalletGhoBalanceLoading
                              ? "Loading..."
                              : walletGhoBalance
                                ? walletGhoBalance.formatted
                                : "0"}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Wrapped GHO</div>
                        <div>
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
                  </div>

                  <div className="bg-background p-4 rounded-md border border-border">
                    <div className="flex justify-between items-center mb-3">
                      <div className="font-medium">Lens Account</div>
                      <div
                        className="text-xs text-muted-foreground bg-muted/50 rounded-md px-2 py-1 border border-border max-w-[120px] truncate"
                        title={accountAddress || ""}
                      >
                        {truncateAddress(accountAddress || "")}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-muted-foreground">Native GHO</div>
                        <div>
                          {!showAccountData
                            ? "0"
                            : isAccountGhoBalanceLoading
                              ? "Loading..."
                              : accountGhoBalance
                                ? accountGhoBalance.formatted
                                : "0"}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Wrapped GHO</div>
                        <div>
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
                  </div>
                </div>
              </div>

              {/* Send Token Section */}
              <div className="bg-muted/30 rounded-lg p-6 space-y-4">
                <h2 className="text-xl font-semibold mb-2">Send Tokens</h2>

                <div className="space-y-3">
                  <div>
                    <label htmlFor="tokenType" className="text-sm font-medium block mb-1">
                      Token Type
                    </label>
                    <select
                      id="tokenType"
                      value={tokenType}
                      onChange={(e) => setTokenType(e.target.value as "native" | "wrapped")}
                      className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
                    >
                      <option value="native">Native GHO</option>
                      <option value="wrapped">Wrapped GHO (wGHO)</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="sendFrom" className="text-sm font-medium block mb-1">
                      Send From
                    </label>
                    <select
                      id="sendFrom"
                      value={sendFrom}
                      onChange={(e) => setSendFrom(e.target.value as "wallet" | "account")}
                      className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
                    >
                      <option value="wallet">Wallet ({truncateAddress(walletAddress || "")})</option>
                      <option value="account">Lens Account ({truncateAddress(accountAddress || "")})</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="recipient" className="text-sm font-medium block mb-1">
                      Recipient Address
                    </label>
                    <input
                      id="recipient"
                      type="text"
                      placeholder="0x..."
                      value={recipientAddress}
                      onChange={(e) => setRecipientAddress(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="amount" className="text-sm font-medium block mb-1">
                      Amount to Send
                    </label>
                    <input
                      id="amount"
                      type="text"
                      placeholder="Amount"
                      value={transferAmount}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "" || /^\d*\.?\d*$/.test(value)) {
                          setTransferAmount(value);
                        }
                      }}
                      className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
                    />
                  </div>

                  <Button
                    onClick={handleSendToken}
                    disabled={
                      isTransferring ||
                      !transferAmount ||
                      Number.parseFloat(transferAmount) <= 0 ||
                      !recipientAddress ||
                      !/^0x[a-fA-F0-9]{40}$/.test(recipientAddress)
                    }
                    className="w-full mt-2"
                  >
                    {isTransferring ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>Send {tokenType === "native" ? "GHO" : "wGHO"}</>
                    )}
                  </Button>
                </div>
              </div>

              <div className="bg-muted/30 rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-3">Need to wrap or unwrap tokens?</h2>
                <p className="text-sm text-muted-foreground mb-3">
                  You can wrap your native GHO tokens to wGHO or unwrap your wGHO tokens back to native GHO.
                </p>
                <Link href="/wrap">
                  <Button variant="outline" className="w-full">
                    Go to Wrap/Unwrap
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-muted/30 rounded-lg p-8 text-center space-y-4">
              <p className="mb-4">No Lens account found. Please create or connect a Lens account to send tokens.</p>
            </div>
          )
        ) : (
          <div className="bg-muted/30 rounded-lg p-8 text-center space-y-4">
            <p className="mb-4">Connect your wallet to send tokens</p>
            <div className="flex justify-center">
              <ConnectWalletButton text="Connect Wallet" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
