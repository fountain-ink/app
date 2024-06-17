import "~/styles/globals.css";

export const metadata = {
	title: "Fountain",
	description: "Collaborative web3 blogging",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
	children,
}: { children: React.ReactNode }) {
	return (
		<html lang="en" className={"scroll-smooth"}>
			<body>{children}</body>
		</html>
	);
}
