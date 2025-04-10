"use client";

import { useAccount, useSignMessage } from "wagmi";
import { getBuilderClient } from "@/lib/lens/client";

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