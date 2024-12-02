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

  "--paragraph-color": string;
  "--paragraph-first-letter-size"?: string;
  "--paragraph-first-letter-float"?: string;
  "--paragraph-first-letter-padding-right"?: string;
  "--paragraph-first-letter-padding-top"?: string;
  "--paragraph-first-letter-initial"?: string;

  "--image-margin-y": string;
  "--image-border-radius": string;
  "--title-margin": string;
  "--subtitle-margin": string;
  "--header-margin": string;
  "--paragraph-margin": string;

  "--date-font": string;

  "--list-margin": string;
  "--list-font": string;
  "--list-weight": string | "100" | "200" | "300" | "400" | "500" | "600" | "800" | "900";
  "--list-style": string | "normal" | "italic";
  "--list-size": string;
  "--list-line-height": string;
  "--list-letter-spacing": string;
  "--list-color": string;
  "--list-indent": string;
  "--list-item-margin": string;
  "--list-item-spacing": string;

  "--blockquote-font": string;
  "--blockquote-weight": "100" | "200" | "300" | "400" | "500" | "600" | "800" | "900";
  "--blockquote-style": "normal" | "italic";
  "--blockquote-size": string;
  "--blockquote-line-height": string;
  "--blockquote-letter-spacing": string;
  "--blockquote-color": string;
  "--blockquote-margin": string;
  "--blockquote-padding": string;
  "--blockquote-border-width": string;
  "--blockquote-border-color": string;
  "--strong-weight": "600" | "700" | "800" | "900";
  
  "--code-block-background": string;
  "--code-block-color": string;
  "--code-block-font": string;
  "--code-block-font-size": string;
  "--code-block-line-height": string;
  "--code-block-padding": string;
  "--code-block-border-radius": string;
  "--code-block-margin": string;
  "--code-block-border": string;
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
    "--secondary": "0 0% 66%",
    "--secondary-foreground": "222.2 47.4% 99.2%",
    "--muted": "0 0% 90%",
    "--muted-foreground": "0 0% 56%",

    "--destructive-foreground": "210 40% 98%",

    "--radius": "1.0rem",

    "--foreground": "0 0% 11%",
    "--background": "0 0% 96%",

    "--accent": "0 0% 90%",
    "--accent-foreground": "222.2 47.4% 11.2%",

    "--title-font": "plantin",
    "--title-weight": "300",
    "--title-style": "italic",
    "--title-align": "center",
    "--title-size": "3.875rem",
    "--title-line-height": "3.875rem",
    "--title-letter-spacing": "-0.075rem",
    "--title-color": "hsl(var(--foreground))",

    "--subtitle-align": "center",
    "--header-align": "left",
    "--paragraph-align": "left",

    "--subtitle-font": "plantin",
    "--subtitle-weight": "400",
    "--subtitle-style": "normal",
    "--subtitle-size": "1.5rem",
    "--subtitle-line-height": "1.4",
    "--subtitle-letter-spacing": "-0.5px",
    "--subtitle-color": "hsl(var(--muted-foreground))",

    "--header-font": "plantin",
    "--header-weight": "600",
    "--header-style": "normal",
    "--header-size": "1.5rem",
    "--header-line-height": "1.2",
    "--header-letter-spacing": "-0.01em",
    "--header-color": "hsl(var(--foreground))",

    "--paragraph-font": "plantin",
    "--paragraph-weight": "400",
    "--paragraph-style": "normal",
    "--paragraph-size": "1.25rem",
    "--paragraph-line-height": "1.6",
    "--paragraph-letter-spacing": "-1%",
    "--paragraph-color": "hsl(var(--foreground))",

    "--paragraph-first-letter-size": "7rem",
    "--paragraph-first-letter-float": "left",
    "--paragraph-first-letter-padding-right": "1rem",
    "--paragraph-first-letter-padding-top": "0.5rem",
    "--paragraph-first-letter-initial": "3",

    "--image-border-radius": "1rem",
    "--image-margin-y": "2.5rem",

    "--title-margin": "3rem",
    "--subtitle-margin": "2rem",
    "--header-margin": "2rem",
    "--paragraph-margin": "1rem",
    "--list-margin": "2rem",

    "--list-font": "var(--paragraph-font)",
    "--list-weight": "var(--paragraph-weight)",
    "--list-style": "var(--paragraph-style)",
    "--list-size": "var(--paragraph-size)",
    "--list-line-height": "var(--paragraph-line-height)",
    "--list-letter-spacing": "var(--paragraph-letter-spacing)",
    "--list-color": "var(--paragraph-color)",
    "--list-indent": "1.5em",
    "--list-item-margin": "0.5em",
    "--list-item-spacing": "1.25em",

    "--blockquote-font": "var(--paragraph-font)",
    "--blockquote-weight": "400",
    "--blockquote-style": "italic",
    "--blockquote-size": "var(--paragraph-size)",
    "--blockquote-line-height": "var(--paragraph-line-height)",
    "--blockquote-letter-spacing": "var(--paragraph-letter-spacing)",
    "--blockquote-color": "hsl(var(--foreground))",
    "--blockquote-margin": "var(--paragraph-margin)",
    "--blockquote-padding": "1rem",
    "--blockquote-border-width": "4px",
    "--blockquote-border-color": "hsl(var(--muted-foreground))",

    "--strong-weight": "700",
    
    "--code-block-background": "hsl(var(--muted))",
    "--code-block-color": "hsl(var(--foreground))",
    "--code-block-font": "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    "--code-block-font-size": "0.9rem",
    "--code-block-line-height": "1.6",
    "--code-block-padding": "1rem",
    "--code-block-border-radius": "0.5rem",
    "--code-block-margin": "1.5rem",
    "--code-block-border": "1px solid hsl(var(--border))",
    
    "--date-font": "proxima-nova-wide",
  },
};
