import { useOnboardingClient } from "@/hooks/use-lens-clients";
import { storageClient } from "@/lib/lens/storage-client";
import { Account, AnyClient } from "@lens-protocol/client";
import { handleOperationWith } from "@lens-protocol/client/viem";
import { account as accountMetadataBuilder, image, MetadataAttribute } from "@lens-protocol/metadata"; // Updated imports
import { useState } from "react";
import { toast } from "sonner";
import { useAccount, useWalletClient } from "wagmi";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { setupUserAuth } from "./auth-manager";
import { ChevronLeft } from "lucide-react"; 
import { GraphicHand2 } from "../icons/custom-icons";
import { OnboardingProfileSetup, ProfileSetupData } from "./onboarding-profile-setup"; 
import { uploadFile } from "@/lib/upload/upload-file";
import { createAccountWithUsername, fetchAccount } from "@lens-protocol/client/actions";

interface OnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

type OnboardingStep = "username" | "profileSetup";

export function OnboardingModal({ open, onOpenChange, onSuccess }: OnboardingModalProps) {
  const { address } = useAccount();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false); 
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>("username");

  const onboardingClient = useOnboardingClient();
  const { data: walletClient } = useWalletClient();

  const handleUsernameSubmit = () => {
    if (!username || !address) return;
    setOnboardingStep("profileSetup");
  };

  const handleGoBackToUsername = () => {
    setOnboardingStep("username");
  }

  const handleFinalSubmit = async (profileData: ProfileSetupData) => {
    if (!username || !address) {
      toast.error("Username is missing.");
      return;
    };

    setLoading(true);
    let pictureUrl: string | undefined; 
    let metadataUri: string | undefined;
    let client: AnyClient | null = null;

    try {
      client = await onboardingClient(); 
      if (!client) {
        throw new Error("Failed to get onboarding client");
      }

      // 1. Upload Profile Picture (if provided and not skipped)
      if (profileData.profilePicture && !profileData.skipped) {
        const uploadToast = toast.loading("Uploading profile picture...");
        try {
          pictureUrl = await uploadFile(profileData.profilePicture);
          toast.dismiss(uploadToast);
        } catch (uploadError) {
          toast.dismiss(uploadToast);
          console.error("Error uploading profile picture:", uploadError);
          toast.error("Failed to upload profile picture. Please try again.");
          setLoading(false);
          return; 
        }
      }

      // 2. Construct Metadata
      const metadata = accountMetadataBuilder({
        name: profileData.skipped ? username : (profileData.name || username), 
        bio: profileData.skipped ? undefined : profileData.bio,
        picture: pictureUrl,
      });

      // 3. Upload Metadata JSON
      const uploadMetaToast = toast.loading("Uploading profile metadata...");
      try {
        const { uri } = await storageClient.uploadAsJson(metadata);
        metadataUri = uri;
        toast.dismiss(uploadMetaToast);
        console.log("Metadata uploaded:", metadataUri);
      } catch (metaUploadError) {
        toast.dismiss(uploadMetaToast);
        console.error("Error uploading metadata:", metaUploadError);
        toast.error("Failed to upload profile metadata. Please try again.");
        setLoading(false);
        return; 
      }


      // 4. Create Account
      const createToast = toast.loading("Creating your account...");
      const result = await createAccountWithUsername(client, {
        username: {
          localName: username,
        },
        metadataUri: metadataUri,
      })
        .andThen(handleOperationWith(walletClient as any))
        .andThen(client.waitForTransaction);

      toast.dismiss(createToast);

      if (result.isErr()) {
        console.error("Error creating account:", result.error);
        toast.error(`Error creating account: ${result.error}`);
        setLoading(false);
        return;
      }

      console.log("Transaction hash:", result.value);

      // 5. Fetch Account
      const fetchToast = toast.loading("Fetching your new account...");
      const accountResult = await fetchAccount(client, { txHash: result.value }).unwrapOr(null);
      toast.dismiss(fetchToast);

      if (!accountResult) {
        toast.error("Failed to fetch account after creation. Please reload and log in.");
        setLoading(false);
        onOpenChange(false); 
        return;
      }
      console.log("Account created:", accountResult);

      // 6. Switch Account
      const switchToast = toast.loading("Switching to your new account...");
      const switchResult = await client.switchAccount({ account: accountResult.address });
      toast.dismiss(switchToast);

      if (switchResult.isErr()) {
        toast.error(`Failed to switch account: ${switchResult.error.message}. Please reload and log in.`);
        console.error("Switch error:", switchResult.error.message);
        setLoading(false);
        onOpenChange(false); 
        return;
      }
      console.log("Switched account:", switchResult.value);

      // 7. Setup Authentication
      const authToast = toast.loading("Setting up authentication...");
      const credentials = await switchResult.value.getCredentials();

      if (credentials.isErr()) {
        toast.dismiss(authToast);
        toast.error("Failed to get credentials. Please reload and log in.");
        setLoading(false);
        onOpenChange(false);
        return;
      }

      const refreshToken = credentials.value?.refreshToken;
      if (!refreshToken) {
        toast.dismiss(authToast);
        toast.error("Failed to get refresh token. Please reload and log in.");
        setLoading(false);
        onOpenChange(false);
        return;
      }

      try {
        await setupUserAuth(refreshToken);
        toast.dismiss(authToast);
      } catch (error) {
        toast.dismiss(authToast);
        console.error("Error setting up user auth:", error);
        toast.error("Failed to complete authentication. Please reload and log in.");
        setLoading(false);
        onOpenChange(false);
        return;
      }

      toast.success("Account created successfully!");

      onSuccess();
      onOpenChange(false);
      window.location.reload(); 

    } catch (err: any) {
      console.error("Error during final account creation:", err);
      toast.error(`Failed to create account: ${err.message || "An unknown error occurred."}`);
      // Reset to username step on general failure?
      // setOnboardingStep("username");
    } finally {
      setLoading(false); 
    }
  };

  const handleOpenChange = (newOpenState: boolean) => {
    if (!newOpenState) {
      setUsername("");
      setLoading(false);
      setOnboardingStep("username");
    }
    onOpenChange(newOpenState);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[400px] flex flex-col">
        {onboardingStep === "username" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-base h-8 flex gap-2 items-center">
                <Button
                  variant="ghost"
                  onClick={() => handleOpenChange(false)}
                  aria-label="Close"
                  size="sm"
                  disabled={loading}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                Choose a username</DialogTitle>
            </DialogHeader>
            <div className="flex-1 flex gap-4 flex-col">
              <div className="flex h-28 mt-4 items-center justify-center">
                <GraphicHand2 />
              </div>
              <p className="text-xs text-muted-foreground">
                Welcome to Fountain! Let's start by choosing your username. Make it a good one - this can't be changed
                later.
              </p>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="mt-4">
                <Button onClick={handleUsernameSubmit} disabled={loading || !username} className="w-full">
                  {loading ? "Processing..." : "Continue"}
                </Button>
              </div>
            </div>
          </>
        )}

        {onboardingStep === "profileSetup" && (
          <OnboardingProfileSetup
            username={username}
            onSubmit={handleFinalSubmit}
            onClose={() => handleOpenChange(false)}
            onBack={handleGoBackToUsername}
            isLoading={loading}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
