export const defaultCssPlaceholder = `/* Article styles */
.article {}
.article img {}
.article iframe {}
.article .title {}
.article .subtitle {}
.article h1 {}
.article h2 {}
.article h3 {}
.article h4 {}
.article p {}
.article blockquote {}
.article ul, .article ol {}
.article .todo-element {}
.article li {}
.article ul li::marker, .article ol li::marker {}
.article strong {}
.article pre {}
.article pre code {}

/* Non-article styles */
.not-article .title {}
.not-article .subtitle {}
.not-article h3 {}
.not-article h4 {}
.not-article p {}
.not-article blockquote {}
.not-article ul {}
.not-article ol {}
.not-article li {}

/* Override theme colors (use !important) */
:root {
  --primary: your-color-here !important;
  --accent: your-color-here !important;
  --muted: your-color-here !important;
}`;

export const cssExamples = {
  basic: {
    title: "Basic Styling",
    description: "Simple customizations for typography and spacing using theme variables",
    css: `/* Typography using theme variables */
.article h1, .article h2, .article h3 {
  font-family: var(--title-font);
  color: hsl(var(--foreground));
  font-weight: var(--title-weight);
}

.article p {
  font-family: var(--paragraph-font);
  line-height: var(--paragraph-line-height);
  color: hsl(var(--foreground));
}

/* Images */
.article img {
  border-radius: var(--image-border-radius);
  box-shadow: 0 4px 6px hsl(var(--muted-foreground) / 0.1);
  margin: var(--image-margin-y) 0;
}

/* Code blocks using theme variables */
.article pre {
  background: var(--code-block-background);
  color: var(--code-block-color);
  border: var(--code-block-border);
  border-radius: var(--code-block-border-radius);
  padding: var(--code-block-padding);
  font-family: var(--code-block-font);
  font-size: var(--code-block-font-size);
}

/* Example: Override accent color for highlights */
:root {
  --accent: 220 90% 95% !important;
  --accent-foreground: 220 90% 15% !important;
}`
  },

  modern: {
    title: "Modern Design",
    description: "Contemporary styling with custom colors and modern typography",
    css: `/* Custom color overrides for modern look */
:root {
  --primary: 236 72% 79% !important;          /* Modern purple */
  --primary-foreground: 236 72% 9% !important;
  --accent: 236 72% 95% !important;           /* Light purple accent */
  --muted: 236 20% 96% !important;
}

/* Modern typography with gradient title */
.article .title {
  background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: var(--title-size);
  font-weight: var(--title-weight);
  margin-bottom: var(--title-margin);
}

.article h1, .article h2, .article h3 {
  font-family: var(--header-font);
  font-weight: var(--header-weight);
  color: hsl(var(--foreground));
  letter-spacing: var(--header-letter-spacing);
}

.article p {
  font-family: var(--paragraph-font);
  font-size: var(--paragraph-size);
  line-height: var(--paragraph-line-height);
  color: hsl(var(--foreground));
}

/* Modern blockquotes */
.article blockquote {
  border-left: var(--blockquote-border-width) solid hsl(var(--primary));
  background: linear-gradient(135deg, hsl(var(--muted)) 0%, hsl(var(--accent) / 0.5) 100%);
  padding: var(--blockquote-padding);
  margin: var(--blockquote-margin) 0;
  border-radius: 0 var(--radius) var(--radius) 0;
  font-style: var(--blockquote-style);
  color: hsl(var(--muted-foreground));
}

/* Enhanced code styling */
.article pre {
  background: hsl(var(--card));
  color: hsl(var(--card-foreground));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);
  padding: var(--code-block-padding);
  overflow-x: auto;
  box-shadow: 0 4px 6px hsl(var(--muted-foreground) / 0.1);
}`
  },

  minimal: {
    title: "Minimal Clean",
    description: "Clean, minimal styling focused on readability with theme consistency",
    css: `/* Minimal typography using theme variables */
.article {
  max-width: 650px;
  margin: 0 auto;
  color: hsl(var(--foreground));
}

.article .title {
  font-family: var(--title-font);
  font-size: var(--title-size);
  font-weight: var(--title-weight);
  color: hsl(var(--foreground));
  margin-bottom: var(--title-margin);
  line-height: var(--title-line-height);
  text-align: var(--title-align);
}

.article p {
  font-family: var(--paragraph-font);
  font-size: var(--paragraph-size);
  line-height: var(--paragraph-line-height);
  color: hsl(var(--foreground));
  margin-bottom: var(--paragraph-margin);
}

.article h1, .article h2, .article h3 {
  font-family: var(--header-font);
  font-weight: var(--header-weight);
  color: hsl(var(--foreground));
  margin-top: var(--header-margin);
  margin-bottom: 1rem;
}

/* Minimal blockquotes */
.article blockquote {
  border-left: 2px solid hsl(var(--border));
  padding-left: 1.5rem;
  color: hsl(var(--muted-foreground));
  font-style: var(--blockquote-style);
  margin: var(--blockquote-margin) 0;
}

/* Simple code blocks */
.article pre {
  background: var(--code-block-background);
  border: var(--code-block-border);
  border-radius: var(--radius);
  padding: var(--code-block-padding);
  overflow-x: auto;
  font-size: var(--code-block-font-size);
  font-family: var(--code-block-font);
}

/* Clean images */
.article img {
  width: 100%;
  height: auto;
  border-radius: var(--image-border-radius);
  margin: var(--image-margin-y) 0;
}`
  },

  colors: {
    title: "Custom Colors",
    description: "Examples of how to override theme color variables",
    css: `/* Override theme color variables with !important */
:root {
  /* Primary colors */
  --primary: 142 76% 36% !important;           /* Custom green */
  --primary-foreground: 0 0% 98% !important;

  /* Accent colors */
  --accent: 142 76% 92% !important;            /* Light green accent */
  --accent-foreground: 142 76% 16% !important;

  /* Muted colors for subtle elements */
  --muted: 142 20% 95% !important;
  --muted-foreground: 142 20% 45% !important;

  /* Border and input colors */
  --border: 142 30% 88% !important;
  --input: 142 30% 88% !important;
}

/* Use the custom colors in your styles */
.article .title {
  color: hsl(var(--primary));
  border-bottom: 2px solid hsl(var(--accent));
  padding-bottom: 1rem;
}

.article blockquote {
  background: hsl(var(--accent) / 0.1);
  border-left: 4px solid hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}

.article pre {
  background: hsl(var(--muted));
  border: 1px solid hsl(var(--border));
  color: hsl(var(--muted-foreground));
}

/* Custom link styles */
.article a {
  color: hsl(var(--primary));
  text-decoration: underline;
  text-decoration-color: hsl(var(--accent));
}

.article a:hover {
  color: hsl(var(--accent-foreground));
  background: hsl(var(--accent));
  padding: 2px 4px;
  border-radius: 4px;
}

/* Alternative: Direct color overrides with !important */
.article .title.custom-color {
  color: #2d7d32 !important; /* Direct green color */
}

.article blockquote.custom-style {
  background: #e8f5e8 !important;
  border-left-color: #2d7d32 !important;
  color: #1b5e20 !important;
}`
  }
};

export type CssExampleKey = keyof typeof cssExamples; 