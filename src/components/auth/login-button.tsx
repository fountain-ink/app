"use client";

import { useLogin } from "@lens-protocol/react";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { Button } from "../ui/button";
import { UserAvatar } from "../user/user-avatar";
import { setupUserAuth } from "./auth-manager";
import { Account } from "@lens-protocol/client";

export function LoginButton({ profile, onSuccess }: { profile: Account; onSuccess: (profile: Account) => void }) {
  const { address } = useAccount();
  const { execute: lensLogin, loading } = useLogin();

  if (!address) {
    return null;
  }

  const login = async () => {
    // const result = await lensLogin({
    //   signMessage
    //   profileId: profile.id,
    // });

    // if (result.isFailure()) {
    //   return toast.error(result.error.message);
    // }

    // set a cookie from the local storage with the refresh token
    const credentials = localStorage.getItem("lens.production.credentials");
    if (!credentials) {
      return toast.error("Failed to get credentials");
    }

    const refreshToken = JSON.parse(credentials)?.data?.refreshToken;

    try {
      await setupUserAuth(refreshToken);
    } catch (error) {
      console.error("Error setting up user auth:", error);
      return toast.error("Failed to complete authentication");
    }

    return onSuccess(profile);
  };

  return (
    <Button
      variant="ghost"
      className="flex items-center justify-center gap-2 text-md w-full"
      disabled={loading}
      onClick={login}
    >
      <UserAvatar profile={profile} className="w-8 h-8" />
      {/* {profile.handle?.localName ?? profile.id} */}
    </Button>
  );
}
