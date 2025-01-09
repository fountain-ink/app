"use client";

import { env } from "@/env";
import { appId, type LensConfig, LensProvider, production } from "@lens-protocol/react-web";
import { bindings } from "@lens-protocol/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { useEffect, useState } from "react";
import { createConfig, http, WagmiProvider } from "wagmi";
import { polygon } from "wagmi/chains";

const wagmiConfig = createConfig(
  getDefaultConfig({
    chains: [polygon],
    transports: {
      [polygon.id]: http(),
    },
    walletConnectProjectId: env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,

    appName: "Fountain",
    appDescription: "Slow social",
    appUrl: "https://fountain.ink",
    appIcon: "https://fountain.ink/logo.png",
  }),
);


export const Web3Providers = ({ children }: { children: JSX.Element }) => {
  const [lensConfig, setLensConfig] = useState<LensConfig | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const config: LensConfig = {
        environment: production,
        bindings: bindings(wagmiConfig),
        storage: window.localStorage,
        params: {
          profile: { metadataSource: appId("fountain") },
        },
      };
      setLensConfig(config);
    }
  }, []);

  const queryClient = new QueryClient();

  if (!lensConfig) return null;

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>
          <LensProvider config={lensConfig}>{children}</LensProvider>
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
