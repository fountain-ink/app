import { ThemeProvider } from "@/components/ThemeContext";
import "@/styles/globals.css";

export const metadata = {
	title: "Fountain",
	description: "where your writing journey begins...",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
};

import { ThirdwebProvider } from "thirdweb/react";

const RootLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<html lang="en">
			<body>
				<main>
					<ThirdwebProvider>
						<ThemeProvider>{children}</ThemeProvider>
					</ThirdwebProvider>
				</main>
			</body>
		</html>
	);
};

export default RootLayout;
