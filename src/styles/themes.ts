export const themeNames = ["light", "dark", "lightSaber"] as const;
export type ThemeType = (typeof themeNames)[number];

export const isValidTheme = (theme: unknown): theme is ThemeType =>
  typeof theme === "string" && themeNames.includes(theme as ThemeType);

type ThemeColors = {
  "--font-title": string;
  "--font-subtitle": string;
  "--font-header": string;
  "--font-paragraph": string;
  "--title-align": "left" | "center" | "right";
  "--background": string;
  "--foreground": string;
  "--card": string;
  "--popover": string;
  "--primary": string;
  "--secondary": string;
  "--muted": string;
  "--accent": string;
  "--destructive": string;
  "--border": string;
  "--input": string;
  "--ring": string;
  "--radius": string;
  "--card-foreground": string;
  "--popover-foreground": string;
  "--primary-foreground": string;
  "--secondary-foreground": string;
  "--muted-foreground": string;
  "--accent-foreground": string;
  "--destructive-foreground": string;

  "--margin-h1": string;
  "--margin-h2": string;
  "--margin-h3": string;
  "--margin-paragraph": string;
  "--margin-list": string;
};

export const globalThemes: Record<ThemeType, ThemeColors> = {
  light: {
    "--font-title": "Test Martina Plantijn",
    "--font-subtitle": "Test Martina Plantijn",
    "--font-header": "Test Martina Plantijn",
    "--font-paragraph": "Cantarell",
    "--title-align": "center",
    "--background": "217 71% 89%",
    "--foreground": "15 33% 19%",
    "--card": "218	8%	98%",
    "--popover": "218	8%	98%",
    "--primary": "213	18%	20%",
    "--secondary": "210 40% 96.1%",
    "--muted": "210 40% 96.1%",
    "--accent": "210 40% 96.1%",
    "--destructive": "0 84.2% 60.2%",
    "--border": "214.3 31.8% 91.4%",
    "--input": "214.3 31.8% 91.4%",
    "--ring": "222.2 84% 4.9%",
    "--radius": "1.0rem",
    "--card-foreground": "222.2 84% 4.9%",
    "--popover-foreground": "222.2 84% 4.9%",
    "--primary-foreground": "210 40% 98%",
    "--secondary-foreground": "222.2 47.4% 11.2%",
    "--muted-foreground": "215.4 16.3% 46.9%",
    "--accent-foreground": "222.2 47.4% 11.2%",
    "--destructive-foreground": "210 40% 98%",

    "--margin-h1": "1rem",
    "--margin-h2": "1.5rem",
    "--margin-h3": "1rem",
    "--margin-paragraph": "1rem",
    "--margin-list": "1rem",
  },
  dark: {
    "--font-title": "Test Martina Plantijn",
    "--font-subtitle": "Test Martina Plantijn",
    "--font-header": "Test Martina Plantijn",
    "--font-paragraph": "Cantarell",
    "--title-align": "center",
    "--background": "222.2 84% 4.9%",
    "--foreground": "110 40% 98%",
    "--card": "222.2 84% 4.9%",
    "--popover": "222.2 84% 4.9%",
    "--primary": "210 40% 98%",
    "--secondary": "217.2 32.6% 17.5%",
    "--muted": "217.2 32.6% 17.5%",
    "--accent": "217.2 32.6% 17.5%",
    "--destructive": "0 62.8% 30.6%",
    "--border": "217.2 32.6% 17.5%",
    "--input": "217.2 32.6% 17.5%",
    "--ring": "212.7 26.8% 83.9%",
    "--radius": "1.0rem",
    "--card-foreground": "210 40% 98%",
    "--popover-foreground": "210 40% 98%",
    "--primary-foreground": "222.2 47.4% 11.2%",
    "--secondary-foreground": "210 40% 98%",
    "--muted-foreground": "215 20.2% 65.1%",
    "--accent-foreground": "210 40% 98%",
    "--destructive-foreground": "210 40% 98%",

    "--margin-h1": "2rem",
    "--margin-h2": "1.5rem",
    "--margin-h3": "1rem",
    "--margin-paragraph": "1rem",
    "--margin-list": "1rem",
  },
  lightSaber: {
    "--font-title": "Test Martina Plantijn",
    "--font-subtitle": "Test Martina Plantijn",
    "--font-header": "Test Martina Plantijn",
    "--font-paragraph": "Cantarell",
    "--title-align": "center",
    "--background": "198 71% 89%",
    "--foreground": "19 33% 19%",
    "--card": "199	8%	98%",
    "--popover": "199	8%	98%",
    "--primary": "133	18%	20%",
    "--secondary": "210 40% 96.1%",
    "--muted": "10 40% 96.1%",
    "--accent": "10 40% 96.1%",
    "--destructive": "0 84.2% 60.2%",
    "--border": "210 31.8% 91.4%",
    "--input": "210 31.8% 91.4%",
    "--ring": "222.2 84% 4.9%",
    "--radius": "1.0rem",
    "--card-foreground": "222.2 84% 4.9%",
    "--popover-foreground": "222.2 84% 4.9%",
    "--primary-foreground": "210 40% 98%",
    "--secondary-foreground": "222.2 47.4% 11.2%",
    "--muted-foreground": "215.4 16.3% 46.9%",
    "--accent-foreground": "222.2 47.4% 11.2%",
    "--destructive-foreground": "210 40% 98%",

    "--margin-h1": "2rem",
    "--margin-h2": "1.5rem",
    "--margin-h3": "1rem",
    "--margin-paragraph": "1rem",
    "--margin-list": "1rem",
  },
};
