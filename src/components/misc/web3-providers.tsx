"use client";

import { chains } from "@lens-chain/sdk/viem";
import { LensProvider } from "@lens-protocol/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PlateController } from "@udecode/plate/react";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { createConfig, http, WagmiProvider } from "wagmi";
import { env } from "@/env";
import { getPublicClient } from "@/lib/lens/client";
import { walletConnectTheme } from "@/styles/walletconnect";

const wagmiConfig = createConfig(
  getDefaultConfig({
    chains: env.NEXT_PUBLIC_ENVIRONMENT === "development" ? [chains.testnet] : [chains.mainnet],
    transports: {
      [chains.mainnet.id]: http(),
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
        <ConnectKitProvider customTheme={walletConnectTheme}>
          <PlateController>
            <LensProvider client={publicClient}>{children}</LensProvider>
          </PlateController>
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
