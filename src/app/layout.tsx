import { Blur } from "@/components/Blur";
import { Header } from "@/components/Header";
import { SmoothScroll } from "@/components/SmoothScroll";
import { ThemeProvider } from "@/components/ThemeContext";
import { Web3Providers } from "@/components/Web3Providers";
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
