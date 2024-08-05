import { Header } from "@/components/Header";
import { ThemeProvider } from "@/components/ThemeContext";
import { Web3Provider } from "@/components/web3/Web3Provider";
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
				<main>
					<Web3Provider>
						<ThemeProvider>
							<Header />
							{children}
						</ThemeProvider>
					</Web3Provider>
				</main>
			</body>
		</html>
	);
};

export default RootLayout;
