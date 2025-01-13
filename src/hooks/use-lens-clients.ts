"use client";

import { useAccount, useSignMessage } from "wagmi";
import { getBuilderClient, getOnboardingClient, getAccountOwnerClient } from "@/lib/lens/client";

export const useBuilderClient = () => {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const authenticate = async () => {
    try {
      if (!address || !signMessageAsync) {
        return null;
      }

      const signMessage = async (message: string) => {
        return await signMessageAsync({ message });
      };

      const builder = await getBuilderClient(address, signMessage);
      return builder;
    } catch (error) {
      console.error("Authentication error:", error);
      return null;
    }
  };

  return authenticate;
};

export const useOnboardingClient = () => {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const authenticate = async () => {
    try {
      if (!address || !signMessageAsync) {
        return null;
      }

      const signMessage = async (message: string) => {
        return await signMessageAsync({ message });
      };

      const onboarding = await getOnboardingClient(address, signMessage);
      return onboarding;
    } catch (error) {
      console.error("Authentication error:", error);
      return null;
    }
  };

  return authenticate;
};

export const useAccountOwnerClient = () => {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const authenticate = async (accountAddress: string) => {
    try {
      if (!address || !signMessageAsync || !accountAddress) {
        return null;
      }

      const signMessage = async (message: string) => {
        return await signMessageAsync({ message });
      };

      const accountOwner = await getAccountOwnerClient(address, accountAddress, signMessage);
      return accountOwner;
    } catch (error) {
      console.error("Authentication error:", error);
      return null;
    }
  };

  return authenticate;
}; 