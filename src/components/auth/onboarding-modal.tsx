import { getOnboardingClient } from "@/lib/lens/client";
import { useState } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useOnboardingClient } from "@/hooks/use-lens-clients";
import { MetadataAttributeType, account } from "@lens-protocol/metadata";
import { storageClient } from "@/lib/lens/storage-client";
import { createAccountWithUsername } from "@lens-protocol/client/actions";

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
       metadataUri : uri,
      });

      if (result.isErr()) {
        console.log("Error creating account:", result.error.message);
        throw new Error("Failed to create account");
      }

      // Wait for transaction to be indexed
      const txHash = result.value.__typename === "CreateAccountResponse" && result.value.hash 
      console.log("Transaction hash:", txHash);

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

