export type ThemeType = "light" | "dark" | "custom"; // etc

type ThemeColors = {
	background: string;
	foreground: string;
	primary: string;
};

export const themes: Record<ThemeType, ThemeColors> = {
	light: {
		background: "0 0% 100%",
		foreground: "222.2 84% 4.9%",
		primary: "222.2 47.4% 11.2%",
	},
	dark: {
		background: "222.2 84% 4.9%",
		foreground: "210 40% 98%",
		primary: "210 40% 98%",
	},
	custom: {
		background: "0 0% 100%",
		foreground: "222.2 84% 4.9%",
		primary: "222.2 47.4% 11.2%",
	},
};
