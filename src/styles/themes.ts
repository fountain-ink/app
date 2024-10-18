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
  "--title-color": string;

  "--subtitle-align": "left" | "center" | "right";
  "--header-align": "left" | "center" | "right";
  "--paragraph-align": "left" | "center" | "right";

  "--paragraph-color": string;

  "--subtitle-font": string;
  "--subtitle-weight": "100" | "200" | "300" | "400" | "500" | "600" | "800" | "900";
  "--subtitle-style": "normal" | "italic";
  "--subtitle-size": string;
  "--subtitle-color": string;

  "--header-color": string;
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

  "--paragraph-first-letter-size"?: string;
  "--paragraph-first-letter-float"?: string;
  "--paragraph-first-letter-padding-right"?: string;
  "--paragraph-first-letter-padding-top"?: string;

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
    "--destructive": "0 84.2% 60.2%",
    "--border": "214.3 31.8% 91.4%",
    "--input": "214.3 31.8% 91.4%",
    "--ring": "222.2 84% 4.9%",
    "--card-foreground": "222.2 84% 4.9%",
    "--popover-foreground": "222.2 84% 4.9%",
    
    "--primary": "213 18% 20%",
    "--primary-foreground": "210 40% 98%",
    "--secondary": "210 40%, 96%",
    "--secondary-foreground": "222.2 47.4% 99.2%",
    "--muted": "210 40% 96.1%",
    "--muted-foreground": "0 0% 56%",
    
    "--destructive-foreground": "210 40% 98%",

    "--radius": "1.0rem",

    "--foreground": "0 0% 11%",
    "--background": "0 0% 96%",
    
    
    "--accent": "210 40% 96%",
    "--accent-foreground": "222.2 47.4% 11.2%",

    "--title-font": "plantin",
    "--title-weight": "300",
    "--title-style": "italic",
    "--title-align": "center",
    "--title-size": "3.3rem",
    "--title-line-height": "1.2",
    "--title-letter-spacing": "-0.02em",
    "--title-color": "hsl(var(--foreground))",

    "--subtitle-align": "center",
    "--header-align": "left",
    "--paragraph-align": "left",

    "--subtitle-font": "plantin",
    "--subtitle-weight": "100",
    "--subtitle-style": "normal",
    "--subtitle-size": "1.5rem",
    "--subtitle-line-height": "1.4",
    "--subtitle-letter-spacing": "-0.5px",
    "--subtitle-color": "hsl(var(--muted-foreground))",

    "--header-font": "plantin",
    "--header-weight": "100",
    "--header-style": "normal",
    "--header-size": "2rem",
    "--header-line-height": "1.3",
    "--header-letter-spacing": "-0.01em",
    "--header-color": "hsl(var(--foreground))",

    "--paragraph-font": "plantin",
    "--paragraph-weight": "400",
    "--paragraph-style": "normal",
    "--paragraph-size": "1.25rem",
    "--paragraph-line-height": "1.6",
    "--paragraph-letter-spacing": "-0.3px",
    "--paragraph-color": "hsl(var(--foreground))",

    "--paragraph-first-letter-size": "7rem",
    "--paragraph-first-letter-float": "left",
    "--paragraph-first-letter-padding-right": "1rem",
    "--paragraph-first-letter-padding-top": "0.5rem",

    "--margin-h1": "1rem",
    "--margin-h2": "1.5rem",
    "--margin-h3": "2rem",
    "--margin-paragraph": "2rem",
    "--margin-list": "1rem",
  },
};
