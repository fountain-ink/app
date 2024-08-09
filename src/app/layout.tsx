import { ThemeProvider } from "@/components/ThemeContext";
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
					<ThemeProvider>{children}</ThemeProvider>
				</Web3Providers>
			</body>
		</html>
	);
};

export default RootLayout;
