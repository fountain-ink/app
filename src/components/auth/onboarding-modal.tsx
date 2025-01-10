import { useOnboardingClient } from "@/hooks/use-lens-clients";
import { storageClient } from "@/lib/lens/storage-client";
import { createAccountWithUsername, fetchAccount, switchAccount, transactionStatus } from "@lens-protocol/client/actions";
import { account } from "@lens-protocol/metadata";
import { useState } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface OnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}


export function OnboardingModal({ open, onOpenChange, onSuccess }: OnboardingModalProps) {
  const { address } = useAccount();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const onboardingClient = useOnboardingClient();

  const handleOnboarding = async () => {
    if (!username || !address) return;

    try {
      setLoading(true);
      const client = await onboardingClient();

      if (!client) {
        throw new Error("Failed to get onboarding client");
      }

      // Create basic account metadata
      const metadata = account({
        name: username,
      });

      // Upload metadata to Lens storage
      const { uri } = await storageClient.uploadAsJson(metadata);
      console.log("Metadata uploaded:", uri);

      // Create the account with username
      const result = await createAccountWithUsername(client, {
        username: {
          localName: username,
        },
        metadataUri: uri,
      });

      if (result.isErr()) {
        console.log("Error creating account:", result.error.message);
        throw new Error("Failed to create account");
      }

      switch (result.value.__typename) {
        case "CreateAccountResponse": {
          const hash = result.value.hash;
          console.log("Transaction hash:", hash);


          const account = await fetchAccount(client, {txHash: hash});
          if (account.isErr()) {
            console.error("Failed to fetch account:", account.error.message);
            throw new Error("Failed to fetch account");
          }

          console.log("Account:", account.value);


          const switchResult = await switchAccount(client, {
            account: account.value?.address,
          });

          if (switchResult.isErr()) {
            console.error("Error switching account:", switchResult.error.message);
            throw new Error("Failed to switch account");
          }

          console.log((`Switched account to ${account.value?.address}`));

          const status = await transactionStatus(client, {
            txHash: hash,
          });

          if (status.isErr()) {
            console.error("Error getting transaction status:", status.error.message);
            throw new Error("Failed to create account");
          }

          switch (status.value.__typename) {
            case "NotIndexedYetStatus":
            case "PendingTransactionStatus":
              console.log("Transaction pending");
              break;
            case "FinishedTransactionStatus":
              console.log("Transaction complete");


              break;
            case "FailedTransactionStatus":
              console.log("Transaction failed:", status.value.reason);
              throw new Error("Failed to create account");
          }
          console.log("CreateAccountResponse:", result.value);
          break;
        }

        case "InvalidUsername":
          console.log("Failed to create account with username:", result.value.reason);
          throw new Error("Failed to create account");
        case "SelfFundedTransactionRequest":
          console.log("Self-funded transaction request:", result.value.raw);
          break;
        case "SponsoredTransactionRequest":
          console.log("Sponsored transaction request:", result.value.raw);
          break;
        case "TransactionWillFail":
          console.log("Transaction will fail:", result.value.reason);
          throw new Error("Failed to create account");
        default:
          console.log("Unknown response:", result.value);
          throw new Error("Failed to create account");
      }

      toast.success("Account created successfully!");
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      console.error("Error during onboarding:", err);
      toast.error("Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-72">
        <DialogHeader>
          <DialogTitle>Create Profile</DialogTitle>
        </DialogHeader>
        <div className="w-full space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleOnboarding} disabled={loading || !username}>
              {loading ? "Creating..." : "Create Account"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
