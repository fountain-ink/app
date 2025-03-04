export const themeNames = ["editorial", "modern"] as const;
export type ThemeType = (typeof themeNames)[number];

export const isValidTheme = (theme: unknown): theme is ThemeType =>
  typeof theme === "string" && themeNames.includes(theme as ThemeType);

export const defaultThemeName = themeNames[0];

export const themeDescriptions: Record<ThemeType, string> = {
  editorial: "Classic readable serif",
  modern: "Clean minimalist sans-serif"
};

type SharedVariables = {
  "--title-font": string;
  "--title-weight": "100" | "200" | "300" | "400" | "500" | "600" | "800" | "900";
  "--title-style": "normal" | "italic";
  "--title-align": "left" | "center" | "right";
  "--title-size": string;
  "--title-color": string;
  "--title-line-height": string;
  "--title-letter-spacing": string;
  "--title-margin": string;

  "--subtitle-align": "left" | "center" | "right";
  "--subtitle-font": string;
  "--subtitle-weight": "100" | "200" | "300" | "400" | "500" | "600" | "800" | "900";
  "--subtitle-style": "normal" | "italic";
  "--subtitle-size": string;
  "--subtitle-color": string;
  "--subtitle-line-height": string;
  "--subtitle-letter-spacing": string;
  "--subtitle-margin": string;

  "--header-align": "left" | "center" | "right";
  "--header-color": string;
  "--header-font": string;
  "--header-weight": "100" | "200" | "300" | "400" | "500" | "600" | "800" | "900";
  "--header-style": "normal" | "italic";
  "--header-size": string;
  "--header-line-height": string;
  "--header-letter-spacing": string;
  "--header-margin": string;

  "--paragraph-align": "left" | "center" | "right";
  "--paragraph-font": string;
  "--paragraph-weight": "100" | "200" | "300" | "400" | "500" | "600" | "800" | "900";
  "--paragraph-style": "normal" | "italic";
  "--paragraph-size": string;
  "--paragraph-line-height": string;
  "--paragraph-letter-spacing": string;
  "--paragraph-color": string;
  "--paragraph-margin": string;
  "--paragraph-first-letter-size"?: string;
  "--paragraph-first-letter-float"?: string;
  "--paragraph-first-letter-padding-right"?: string;
  "--paragraph-first-letter-padding-top"?: string;
  "--paragraph-first-letter-initial"?: string;

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

  "--image-margin-y": string;
  "--image-border-radius": string;

  "--radius": string;
};

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
  "--card-foreground": string;
  "--popover-foreground": string;
  "--primary-foreground": string;
  "--secondary-foreground": string;
  "--muted-foreground": string;
  "--accent-foreground": string;
  "--destructive-foreground": string;
};

type ColorTheme = {
  light: ThemeColors;
  dark: ThemeColors;
  shared: SharedVariables;
};

export const globalThemes: Record<ThemeType, ColorTheme> = {
  modern: {
    light: {
      "--card": "350 20% 99%",
      "--popover": "0 0% 99%",
      "--destructive": "0 84.2% 60.2%",
      "--border": "350 31.8% 91.4%",
      "--input": "350 31.8% 91.4%",
      "--ring": "350 31.8% 91.4%",
      "--card-foreground": "350 84% 4.9%",
      "--popover-foreground": "350 84% 4.9%",
      "--primary": "350 18% 20%",
      "--primary-foreground": "350 40% 98%",
      "--secondary": "350 20% 66%",
      "--secondary-foreground": "350 47.4% 99.2%",
      "--muted": "350 20% 90%",
      "--muted-foreground": "350 20% 56%",
      "--destructive-foreground": "350 40% 98%",
      "--foreground": "350 20% 11%",
      "--background": "350 20% 96%",
      "--accent": "350 20% 90%",
      "--accent-foreground": "350 47.4% 11.2%",
    },
    dark: {
      "--card": "350 20% 3.9%",
      "--popover": "240 4% 9.8%",
      "--destructive": "0 84.2% 60.2%",
      "--border": "0 0% 14%",
      "--input": "350 31.8% 20%",
      "--ring": "0 0% 14%",
      "--card-foreground": "350 20% 98%",
      "--popover-foreground": "350 20% 98%",
      "--primary": "350 18% 80%",
      "--primary-foreground": "350 40% 2%",
      "--secondary": "350 20% 33%",
      "--secondary-foreground": "350 47.4% 0.8%",
      "--muted": "350 20% 15%",
      "--muted-foreground": "350 20% 64%",
      "--destructive-foreground": "350 40% 98%",
      "--foreground": "350 20% 98%",
      "--background": "350 20% 3.9%",
      "--accent": "350 20% 15%",
      "--accent-foreground": "350 20% 98%",
    },
    shared: {
      "--radius": "0.75rem",
      "--title-font": "Geist, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      "--title-weight": "500",
      "--title-style": "normal",
      "--title-align": "center",
      "--title-size": "4rem",
      "--title-line-height": "4rem",
      "--title-letter-spacing": "-0.8px",
      "--title-color": "hsl(var(--foreground))",
      "--title-margin": "3rem",

      "--subtitle-font": "Geist, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      "--subtitle-weight": "400",
      "--subtitle-style": "normal",
      "--subtitle-size": "1.5rem",
      "--subtitle-line-height": "1.4",
      "--subtitle-letter-spacing": "-0.8px",
      "--subtitle-color": "hsl(var(--muted-foreground))",
      "--subtitle-margin": "2rem",
      "--subtitle-align": "center",

      "--header-font": "Geist",
      "--header-weight": "600",
      "--header-style": "normal",
      "--header-size": "1.75rem",
      "--header-line-height": "1.2",
      "--header-letter-spacing": "-0.8px",
      "--header-color": "hsl(var(--foreground))",
      "--header-margin": "2rem",
      "--header-align": "left",

      "--paragraph-font": "Geist",
      "--paragraph-weight": "400",
      "--paragraph-style": "normal",
      "--paragraph-size": "1.125rem",
      "--paragraph-line-height": "1.7",
      "--paragraph-letter-spacing": "0",
      "--paragraph-color": "hsl(var(--foreground))",
      "--paragraph-margin": "1rem",
      "--paragraph-align": "left",
      "--paragraph-first-letter-size": "3rem",
      "--paragraph-first-letter-float": "left",
      "--paragraph-first-letter-padding-right": "0.5rem",
      "--paragraph-first-letter-padding-top": "0.25rem",
      "--paragraph-first-letter-initial": "1",

      "--list-margin": "1rem",
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
      "--blockquote-size": "1.5rem",
      "--blockquote-line-height": "var(--paragraph-line-height)",
      "--blockquote-letter-spacing": "var(--paragraph-letter-spacing)",
      "--blockquote-color": "hsl(var(--foreground))",
      "--blockquote-margin": "1rem",
      "--blockquote-padding": "1.25rem",
      "--blockquote-border-width": "3px",
      "--blockquote-border-color": "hsl(var(--muted-foreground))",

      "--strong-weight": "600",

      "--code-block-background": "hsl(var(--muted))",
      "--code-block-color": "hsl(var(--foreground))",
      "--code-block-font": "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      "--code-block-font-size": "0.9rem",
      "--code-block-line-height": "1.6",
      "--code-block-padding": "1.25rem",
      "--code-block-border-radius": "0.75rem",
      "--code-block-margin": "1rem",
      "--code-block-border": "1px solid hsl(var(--border))",

      "--image-border-radius": "0.75rem",
      "--image-margin-y": "2.75rem",

      "--date-font": "proxima-nova-wide",
    },
  },
  editorial: {
    light: {
      "--card": "0 0% 99%",
      "--popover": "0 0% 99%",
      "--destructive": "0 84.2% 60.2%",
      "--border": "214.3 31.8% 91.4%",
      "--input": "214.3 31.8% 91.4%",
      "--ring": "222.2 84% 4.9%",
      "--card-foreground": "222.2 84% 4.9%",
      "--popover-foreground": "222.2 84% 4.9%",
      "--primary": "0 0% 0%",
      "--primary-foreground": "0 0% 100%",
      "--secondary": "0 0% 66%",
      "--secondary-foreground": "222.2 47.4% 99.2%",
      "--muted": "0 0% 90%",
      "--muted-foreground": "0 0% 56%",
      "--destructive-foreground": "210 40% 98%",
      "--foreground": "0 0% 11%",
      "--background": "0 0% 96%",
      "--accent": "0 0% 90%",
      "--accent-foreground": "222.2 47.4% 11.2%",
    },
    dark: {
      "--card": "0 0% 3.9%",
      "--popover": "240 4% 9.8%",
      "--destructive": "0 84.2% 60.2%",
      "--border": "0 0% 14%",
      "--input": "214.3 31.8% 20%",
      "--ring": "0 0% 14%",
      "--card-foreground": "0 0% 98%",
      "--popover-foreground": "0 0% 98%",
      "--primary": "0 0% 100%",
      "--primary-foreground": "0 0% 0%",
      "--secondary": "0 0% 33%",
      "--secondary-foreground": "222.2 47.4% 0.8%",
      "--muted": "0 0% 15%",
      "--muted-foreground": "0 0% 64%",
      "--destructive-foreground": "210 40% 98%",
      "--foreground": "0 0% 98%",
      "--background": "0 0% 3.9%",
      "--accent": "0 0% 15%",
      "--accent-foreground": "0 0% 98%",
    },
    shared: {
      "--radius": "0.75rem",
      "--title-font": "plantin",
      "--title-weight": "300",
      "--title-style": "italic",
      "--title-align": "center",
      "--title-size": "3.875rem",
      "--title-line-height": "3.875rem",
      "--title-letter-spacing": "-0.8px",
      "--title-color": "hsl(var(--foreground))",
      "--title-margin": "3rem",

      "--subtitle-font": "plantin",
      "--subtitle-weight": "400",
      "--subtitle-style": "normal",
      "--subtitle-size": "1.5rem",
      "--subtitle-line-height": "1.4",
      "--subtitle-letter-spacing": "-0.8px",
      "--subtitle-color": "hsl(var(--muted-foreground))",
      "--subtitle-margin": "2rem",
      "--subtitle-align": "center",

      "--header-font": "plantin",
      "--header-weight": "600",
      "--header-style": "normal",
      "--header-size": "1.5rem",
      "--header-line-height": "1.2",
      "--header-letter-spacing": "-0.8px",
      "--header-color": "hsl(var(--foreground))",
      "--header-margin": "1rem",
      "--header-align": "left",

      "--paragraph-font": "plantin",
      "--paragraph-weight": "400",
      "--paragraph-style": "normal",
      "--paragraph-size": "1.25rem",
      "--paragraph-line-height": "1.6",
      "--paragraph-letter-spacing": "-0.2px",
      "--paragraph-color": "hsl(var(--foreground))",
      "--paragraph-margin": "1rem",
      "--paragraph-align": "left",
      "--paragraph-first-letter-size": "7rem",
      "--paragraph-first-letter-float": "left",
      "--paragraph-first-letter-padding-right": "1rem",
      "--paragraph-first-letter-padding-top": "0.5rem",
      "--paragraph-first-letter-initial": "3",

      "--list-margin": "0.5rem",
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
      "--blockquote-size": "1.5rem",
      "--blockquote-line-height": "var(--paragraph-line-height)",
      "--blockquote-letter-spacing": "var(--paragraph-letter-spacing)",
      "--blockquote-color": "hsl(var(--foreground))",
      "--blockquote-margin": "1rem",
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
      "--code-block-border-radius": "0.75rem",
      "--code-block-margin": "1.5rem",
      "--code-block-border": "1px solid hsl(var(--border))",

      "--image-border-radius": "0.75rem",
      "--image-margin-y": "2.5rem",

      "--date-font": "proxima-nova-wide",
    },
  },
};

export default function setGlobalColorTheme(themeMode: "light" | "dark", themeName: ThemeType) {
  if (!globalThemes[themeName]) {
    throw new Error(`Theme "${themeName}" not found`);
  }

  const theme = globalThemes[themeName];
  const colorTheme = theme[themeMode];
  const sharedTheme = theme.shared;

  if (!colorTheme || !sharedTheme) {
    throw new Error(`Invalid theme configuration for "${themeName}: ${colorTheme} ${sharedTheme} ${themeMode}"`);
  }

  // biome-ignore lint/complexity/noForEach: <explanation>
  Object.entries(colorTheme).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });

  // biome-ignore lint/complexity/noForEach: <explanation>
  Object.entries(sharedTheme).forEach(([key, value]) => {
    if (value !== undefined) {
      document.documentElement.style.setProperty(key, value);
    }
  });
}
