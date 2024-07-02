export const themeNames = ["light", "dark"] as const; // append to this to add more themes

export type ThemeType = (typeof themeNames)[number];

type ThemeColors = {
	background: string;
	foreground: string;
	card: string;
	popover: string;
	primary: string;
	secondary: string;
	muted: string;
	accent: string;
	destructive: string;
	border: string;
	input: string;
	ring: string;
	radius: string;
	"card-foreground": string;
	"popover-foreground": string;
	"primary-foreground": string;
	"secondary-foreground": string;
	"muted-foreground": string;
	"accent-foreground": string;
	"destructive-foreground": string;
};

export const themes: Record<ThemeType, ThemeColors> = {
	light: {
		background: "#d0dff7",
		foreground: "#432a21",
		card: "0 0% 100%",
		popover: "0 0% 100%",
		primary: "222.2 47.4% 11.2%",
		secondary: "210 40% 96.1%",
		muted: "210 40% 96.1%",
		accent: "210 40% 96.1%",
		destructive: "0 84.2% 60.2%",
		border: "214.3 31.8% 91.4%",
		input: "214.3 31.8% 91.4%",
		ring: "222.2 84% 4.9%",
		radius: "0.5rem",

		"card-foreground": "222.2 84% 4.9%",
		"popover-foreground": "222.2 84% 4.9%",
		"primary-foreground": "210 40% 98%",
		"secondary-foreground": "222.2 47.4% 11.2%",
		"muted-foreground": "215.4 16.3% 46.9%",
		"accent-foreground": "222.2 47.4% 11.2%",
		"destructive-foreground": "210 40% 98%",
	},
	dark: {
		background: "222.2 84% 4.9%",
		foreground: "210 40% 98%",
		card: "222.2 84% 4.9%",
		popover: "222.2 84% 4.9%",
		primary: "210 40% 98%",
		secondary: "217.2 32.6% 17.5%",
		muted: "217.2 32.6% 17.5%",
		accent: "217.2 32.6% 17.5%",
		destructive: "0 62.8% 30.6%",
		border: "217.2 32.6% 17.5%",
		input: "217.2 32.6% 17.5%",
		ring: "212.7 26.8% 83.9%",
		radius: "0.5rem",

		"card-foreground": "210 40% 98%",
		"popover-foreground": "210 40% 98%",
		"primary-foreground": "222.2 47.4% 11.2%",
		"secondary-foreground": "210 40% 98%",
		"muted-foreground": "215 20.2% 65.1%",
		"accent-foreground": "210 40% 98%",
		"destructive-foreground": "210 40% 98%",
	},
};
