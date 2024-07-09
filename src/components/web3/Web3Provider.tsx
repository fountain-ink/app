"use client";

import { env } from "@/env";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { http, WagmiProvider, createConfig } from "wagmi";
import { mainnet } from "wagmi/chains";

const config = createConfig(
	getDefaultConfig({
		chains: [mainnet],
		transports: {
			[mainnet.id]: http(
				`https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`,
			),
		},
		walletConnectProjectId: env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,

		appName: "Fountain",
		appDescription: "Slow social",
		appUrl: "https://fountain.ink", 
		appIcon: "https://fountain.ink/logo.png",
	}),
);

const queryClient = new QueryClient();

export const Web3Provider = ({ children }: { children: JSX.Element }) => {
	return (
		<WagmiProvider config={config}>
			<QueryClientProvider client={queryClient}>
				<ConnectKitProvider>{children}</ConnectKitProvider>
			</QueryClientProvider>
		</WagmiProvider>
	);
};
