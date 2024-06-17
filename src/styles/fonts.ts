import { EB_Garamond } from "next/font/google";

export const garamond = EB_Garamond({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-garamond",
});

export const serifFontVar = garamond.variable