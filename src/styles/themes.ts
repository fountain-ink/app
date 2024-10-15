export const themeNames = ["editorial"] as const;
export type ThemeType = (typeof themeNames)[number];

export const isValidTheme = (theme: unknown): theme is ThemeType =>
  typeof theme === "string" && themeNames.includes(theme as ThemeType);

export const defaultTheme = themeNames[0];

type ThemeColors = {
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
  "--title-font": string;
  "--title-weight": "100" | "200" | "300" | "400" | "500" | "600" | "800" | "900";
  "--title-style": "normal" | "italic";
  "--title-align": "left" | "center" | "right";
  "--title-size": string;

  "--subtitle-font": string;
  "--subtitle-weight": "100" | "200" | "300" | "400" | "500" | "600" | "800" | "900";
  "--subtitle-style": "normal" | "italic";
  "--subtitle-size": string;

  "--header-font": string;
  "--header-weight": "100" | "200" | "300" | "400" | "500" | "600" | "800" | "900";
  "--header-style": "normal" | "italic";
  "--header-size": string;

  "--paragraph-font": string;
  "--paragraph-weight": "100" | "200" | "300" | "400" | "500" | "600" | "800" | "900";
  "--paragraph-style": "normal" | "italic";
  "--paragraph-size": string;

  "--title-line-height": string;
  "--title-letter-spacing": string;

  "--subtitle-line-height": string;
  "--subtitle-letter-spacing": string;

  "--header-line-height": string;
  "--header-letter-spacing": string;

  "--paragraph-line-height": string;
  "--paragraph-letter-spacing": string;

  "--margin-h1": string;
  "--margin-h2": string;
  "--margin-h3": string;
  "--margin-paragraph": string;
  "--margin-list": string;
};

export const globalThemes: Record<ThemeType, ThemeColors> = {
  editorial: {
    "--card": "0 0%	99%",
    "--popover": "0 0% 99%",
    "--muted": "210 40% 96.1%",
    "--destructive": "0 84.2% 60.2%",
    "--border": "214.3 31.8% 91.4%",
    "--input": "214.3 31.8% 91.4%",
    "--ring": "222.2 84% 4.9%",
    "--card-foreground": "222.2 84% 4.9%",
    "--popover-foreground": "222.2 84% 4.9%",
    "--primary-foreground": "210 40% 98%",
    "--secondary-foreground": "222.2 47.4% 99.2%",
    "--muted-foreground": "215.4 16.3% 46.9%",
    "--accent-foreground": "222.2 47.4% 11.2%",
    "--destructive-foreground": "210 40% 98%",

    "--radius": "1.0rem",

    "--foreground": "hsl(0, 0%, 11%)",
    "--background": "hsl(0, 0%, 96%)",
    "--primary": "hsl(213, 18%, 20%)",
    "--secondary": "hsl(210, 40%, 96%)",
    "--accent": "hsl(210, 40%, 96%)",

    "--title-font": "plantin",
    "--title-weight": "300",
    "--title-style": "italic",
    "--title-align": "center",
    "--title-size": "3.3rem",
    "--title-line-height": "1.2",
    "--title-letter-spacing": "-0.02em",

    "--subtitle-font": "plantin",
    "--subtitle-weight": "100",
    "--subtitle-style": "normal",
    "--subtitle-size": "1.5rem",
    "--subtitle-line-height": "1.4",
    "--subtitle-letter-spacing": "normal",

    "--header-font": "plantin",
    "--header-weight": "100",
    "--header-style": "normal",
    "--header-size": "2rem",
    "--header-line-height": "1.3",
    "--header-letter-spacing": "-0.01em",

    "--paragraph-font": "plantin",
    "--paragraph-weight": "400",
    "--paragraph-style": "normal",
    "--paragraph-size": "1.3rem",
    "--paragraph-line-height": "1.3",
    "--paragraph-letter-spacing": "normal",

    "--margin-h1": "1rem",
    "--margin-h2": "1.5rem",
    "--margin-h3": "2rem",
    "--margin-paragraph": "1rem",
    "--margin-list": "1rem",
  },
};
