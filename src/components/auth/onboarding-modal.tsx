import { useOnboardingClient } from "@/hooks/use-lens-clients";
import { storageClient } from "@/lib/lens/storage-client";
import { createAccountWithUsername, fetchAccount, enableSignless } from "@lens-protocol/client/actions";
import { handleOperationWith } from "@lens-protocol/client/viem";
import { account } from "@lens-protocol/metadata";
import { useState } from "react";
import { toast } from "sonner";
import { useAccount, useWalletClient } from "wagmi";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";

interface OnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function OnboardingModal({ open, onOpenChange, onSuccess }: OnboardingModalProps) {
  const { address } = useAccount();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [enableSignlessMode, setEnableSignlessMode] = useState(true);
  const onboardingClient = useOnboardingClient();
  const { data: walletClient } = useWalletClient();

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
      })
        .andThen(handleOperationWith(walletClient as any))
        .andThen(client.waitForTransaction);

      if (result.isErr()) {
        console.log("Error creating account:", result.error.message);
        toast.error(`Error creating account ${result.error.message}`);
        return onOpenChange(false);
      }

      console.log("Transaction hash:", result.value);

      const accountResult = await fetchAccount(client, { txHash: result.value }).unwrapOr(null);

      if (!accountResult) {
        toast.error("Failed to fetch account after creation");
        return onOpenChange(false);
      }
      console.log("Account:", accountResult);

      const switchResult = await client.switchAccount({account: accountResult.address});

      if (switchResult.isErr()) {
        toast.error(`Failed to switch account ${switchResult.error.message}`);
        console.error(switchResult.error.message)
        return onOpenChange(false);
      }

      console.log("Switched account:", switchResult.value);

      // Enable signless mode if selected
      if (enableSignlessMode) {
        const signlessResult = await enableSignless(client)
          .andThen(handleOperationWith(walletClient as any))
          .andThen(client.waitForTransaction);

        if (signlessResult.isErr()) {
          console.error("Failed to enable signless mode:", signlessResult.error);
          toast.error("Failed to enable signless mode");
        } else {
          console.log("Signless mode enabled:", signlessResult.value);
        }
      }

      toast.success("Account created successfully!");
      onSuccess();
      onOpenChange(false);
      
      // Reload the page
      window.location.reload();
    } catch (err) {
      console.error("Error during onboarding:", err);
      toast.error("Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-96  flex flex-col">
        <DialogHeader>
          <DialogTitle>Create Testnet Profile</DialogTitle>
        </DialogHeader>
        <div className="flex-1 flex flex-col">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="signless" 
                checked={enableSignlessMode}
                onCheckedChange={(checked) => setEnableSignlessMode(checked as boolean)}
              />
              <div className="grid gap-0.5 leading-none">
                <Label htmlFor="signless">Enable signless</Label>
                <p className="text-xs text-muted-foreground">
                  Sign simple actions for me (recommended)
                </p>
              </div>
            </div>
          </div>
          <div className="mt-auto pt-6 flex justify-end">
            <Button 
              onClick={handleOnboarding} 
              disabled={loading || !username}
            >
              {loading ? "Creating..." : "Create Account"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
