import { Web3Providers } from "@/components/web3-providers";
import { Blur } from "@/components/blur";
import { Header } from "@/components/header";
import { SmoothScroll } from "@/components/smooth-scroll";
import { ThemeProvider } from "@/components/theme-context";
import { Toaster } from "@/components/ui/sonner";

import "@/styles/globals.css";

export const metadata = {
	title: "Fountain",
	description: "where your writing journey begins...",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<html lang="en">
			<body>
				<Web3Providers>
					<ThemeProvider>
						<SmoothScroll>
							<Toaster position="top-center" offset={16} />
							<Header />
							<Blur />
							{children}
						</SmoothScroll>
					</ThemeProvider>
				</Web3Providers>
			</body>
		</html>
	);
};

export default RootLayout;
