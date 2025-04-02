import { useOnboardingClient } from "@/hooks/use-lens-clients";
import { storageClient } from "@/lib/lens/storage-client";
import { Account, AnyClient } from "@lens-protocol/client";
import { handleOperationWith } from "@lens-protocol/client/viem";
import { account as accountMetadataBuilder, image, MetadataAttribute } from "@lens-protocol/metadata"; // Updated imports
import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { useAccount, useWalletClient } from "wagmi";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { setupUserAuth } from "./auth-manager";
import { ChevronLeft, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { GraphicHand2 } from "../icons/custom-icons";
import { OnboardingProfileSetup, ProfileSetupData } from "./onboarding-profile-setup";
import { uploadFile } from "@/lib/upload/upload-file";
import { canCreateUsername, createAccountWithUsername, fetchAccount } from "@lens-protocol/client/actions";
import { never } from "@lens-protocol/client";
import { getLensClient } from "@/lib/lens/client";

interface OnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

type OnboardingStep = "username" | "profileSetup";
type ValidationStatus = "idle" | "checking" | "valid" | "invalid";

export function OnboardingModal({ open, onOpenChange, onSuccess }: OnboardingModalProps) {
  const { address } = useAccount();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>("username");
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>("idle");
  const [validationMessage, setValidationMessage] = useState<string>("");
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { data: walletClient } = useWalletClient();

  const validateUsername = useCallback(async (name: string) => {
    if (!name || name.length <= 2) {
      setValidationStatus("idle");
      setValidationMessage("");
      return false;
    }

    setValidationStatus("checking");

    try {
      const client = await getLensClient();
      if (!client || !client.isSessionClient()) {
        throw new Error("Failed to get onboarding client");
      }

      const result = await canCreateUsername(client, {
        localName: name,
      });

      if (result.isErr()) {
        setValidationStatus("invalid");
        console.error("Error checking username availability:", result.error);
        setValidationMessage("Error checking username availability");
        return false;
      }

      const data = result.value;
      switch (data.__typename) {
        case "NamespaceOperationValidationPassed":
          setValidationStatus("valid");
          setValidationMessage("Username is available");
          return true;
        case "NamespaceOperationValidationFailed":
          setValidationStatus("invalid");
          setValidationMessage(data.reason || "Username validation failed");
          return false;
        case "NamespaceOperationValidationUnknown":
          setValidationStatus("invalid");
          setValidationMessage("Username validation status unknown");
          return false;
        case "UsernameTaken":
          setValidationStatus("invalid");
          setValidationMessage("Username is already taken");
          return false;
        default:
          setValidationStatus("invalid");
          setValidationMessage("Unknown validation error");
          return false;
      }
    } catch (error) {
      console.error("Username validation error:", error);
      setValidationStatus("invalid");
      setValidationMessage("Error validating username");
      return false;
    }
  }, []);

  // Handle username changes with proper debouncing
  const handleUsernameChange = useCallback((value: string) => {
    setUsername(value);

    // Reset validation status immediately when input changes
    if (validationStatus !== "idle" && validationStatus !== "checking") {
      setValidationStatus("idle");
      setValidationMessage("");
    }

    // Clear any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    // Only validate if username has sufficient length
    if (value && value.length > 2) {
      // Set a new timer
      debounceTimerRef.current = setTimeout(() => {
        validateUsername(value);
      }, 500);
    }
  }, [validateUsername, validationStatus]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleUsernameSubmit = async () => {
    if (!username || !address) return;

    // If validation hasn't been done yet or is in progress, validate now
    if (validationStatus === "idle" || validationStatus === "checking") {
      setValidationStatus("checking");
      const isValid = await validateUsername(username);
      if (!isValid) {
        toast.error(validationMessage || "Username is not available");
        return;
      }
    } else if (validationStatus === "invalid") {
      toast.error(validationMessage || "Username is not available");
      return;
    }

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
      client = await getLensClient();
      if (!client || !client.isSessionClient()) {
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

      // 4. Create Account, Fetch and Switch account
      const createToast = toast.loading("Creating your account...");

      if (!client || client === null) {
        throw new Error("Failed to get onboarding client");
      }

      const result = await createAccountWithUsername(client, {
        username: {
          localName: username,
        },
        metadataUri: metadataUri,
      })
        .andThen(handleOperationWith(walletClient as any))
        .andThen(client.waitForTransaction)
        .andThen((txHash) => {
          console.log("Transaction hash:", txHash);
          return fetchAccount(client as AnyClient, { txHash });
        })
        .andThen((account) => {
          if (!account) return never("Account not found");
          console.log("Account created:", account);
          if (client && client.isSessionClient()) {
            return client.switchAccount({
              account: account.address,
            });
          } else {
            return never("Client is not a session client");
          }
        });

      toast.dismiss(createToast);

      if (result.isErr()) {
        console.error("Error in account creation flow:", result.error);
        toast.error(`Error: ${result.error || "Failed to complete account setup"}`);
        setLoading(false);
        return;
      }

      // 7. Setup Authentication
      const authToast = toast.loading("Setting up authentication...");
      const sessionClient = result.value;
      const credentials = await sessionClient.getCredentials();

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
      setValidationStatus("idle");
      setValidationMessage("");
      // Clear any pending timers
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
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
                  <div className="relative">
                    <Input
                      id="username"
                      placeholder="Enter username"
                      value={username}
                      onChange={(e) => handleUsernameChange(e.target.value)}
                      disabled={loading}
                      className={
                        validationStatus === "invalid"
                          ? "pr-10 border-red-500 focus-visible:ring-red-500"
                          : validationStatus === "valid"
                            ? "pr-10 border-green-500 focus-visible:ring-green-500"
                            : "pr-10"
                      }
                    />
                    {validationStatus === "checking" && (
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    )}
                    {validationStatus === "valid" && (
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      </div>
                    )}
                    {validationStatus === "invalid" && (
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <XCircle className="h-4 w-4 text-red-500" />
                      </div>
                    )}
                  </div>
                  {validationStatus === "invalid" && validationMessage && (
                    <p className="text-xs text-red-500 mt-1">{validationMessage}</p>
                  )}
                  {validationStatus === "valid" && (
                    <p className="text-xs text-green-500 mt-1">{validationMessage}</p>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <Button
                  onClick={handleUsernameSubmit}
                  disabled={loading || !username || validationStatus === "checking" || validationStatus === "invalid"}
                  className="w-full"
                >
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
