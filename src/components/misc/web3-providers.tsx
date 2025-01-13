"use client";

import { env } from "@/env";
import { getPublicClient } from "@/lib/lens/client";
import { LensProvider } from "@lens-protocol/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { polygon } from "viem/chains";
import { createConfig, http, WagmiProvider } from "wagmi";
import { chains } from "@lens-network/sdk/viem";

const wagmiConfig = createConfig(
  getDefaultConfig({
    // Add both chains
    chains: [chains.testnet, polygon],
    transports: {
      [polygon.id]: http(),
      [chains.testnet.id]: http(),
    },
    walletConnectProjectId: env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,

    appName: "Fountain",
    appDescription: "Slow social",
    appUrl: "https://fountain.ink",
    appIcon: "https://fountain.ink/logo.png",
  }),
);

export const Web3Providers = ({ children }: { children: JSX.Element }) => {
  const queryClient = new QueryClient();
  const publicClient = getPublicClient();

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>
          <LensProvider client={publicClient}>{children}</LensProvider>
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
