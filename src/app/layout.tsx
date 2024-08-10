import { Header } from "@/components/Header";
import { ThemeProvider } from "@/components/ThemeContext";
import { Toaster } from "@/components/ui/sonner";
import { Web3Providers } from "@/components/Web3Providers";
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
						<Toaster position="top-center" offset={16} />
						<Header />
						{children}
					</ThemeProvider>
				</Web3Providers>
			</body>
		</html>
	);
};

export default RootLayout;
