"use client";

import { env } from "@/env";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { http, WagmiProvider, createConfig } from "wagmi";
import { LensProvider } from "@lens-protocol/react-web";
import { mainnet, polygon } from "wagmi/chains";
import { LensConfig, production } from "@lens-protocol/react-web";
import { bindings } from "@lens-protocol/wagmi";

const config = createConfig(
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

const lensConfig: LensConfig = {
	environment: production,
	bindings: bindings(config),
};

const queryClient = new QueryClient();

export const Web3Provider = ({ children }: { children: JSX.Element }) => {
	return (
		<WagmiProvider config={config}>
			<QueryClientProvider client={queryClient}>
				<ConnectKitProvider>
					<LensProvider config={lensConfig}>{children}</LensProvider>
				</ConnectKitProvider>
			</QueryClientProvider>
		</WagmiProvider>
	);
};
