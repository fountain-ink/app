import { Header } from "@/components/Header";
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
						<Toaster position="top-center" offset={16} />
						<Header />
						{children}
						<div className="gradient-blur h-64 w-full fixed bottom-0" />
					</ThemeProvider>
				</Web3Providers>
			</body>
		</html>
	);
};

export default RootLayout;
