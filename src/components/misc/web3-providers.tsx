"use client";

import { env } from "@/env";
import { getPublicClient } from "@/lib/lens/client";
import { LensProvider } from "@lens-protocol/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { createConfig, http, WagmiProvider } from "wagmi";
import { polygon } from "wagmi/chains";

// Add Lens Testnet chain configuration
const lensTestnet = {
  id: 37111,
  name: 'Lens Network Sepolia Testnet',
  network: 'lens-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'GRASS',
    symbol: 'GRASS',
  },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.lens.dev'] },
    public: { http: ['https://rpc.testnet.lens.dev'] },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://block-explorer.testnet.lens.dev' },
  },
} as const;

const wagmiConfig = createConfig(
  getDefaultConfig({
    // Add both chains
    chains: [lensTestnet],
    transports: {
      // [polygon.id]: http(),
      [lensTestnet.id]: http(),
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
          <LensProvider client={publicClient}>
            
            {children}
          
          </LensProvider>
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
