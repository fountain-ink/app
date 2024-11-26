import { CookieManager } from "@/components/auth/cookie-manager";
import { Blur } from "@/components/navigation/gradient-blur";
import { Header } from "@/components/navigation/header";
import { SmoothScroll } from "@/components/smooth-scroll";
import { ThemeProvider } from "@/components/theme/theme-context";
import { Toaster } from "@/components/ui/sonner";
import { Web3Providers } from "@/components/web3-providers";

import "@/styles/globals.css";
import { cn } from "@udecode/cn";

export const metadata = {
  title: "Fountain",
  description: "where your writing journey begins...",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <head>
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <link rel="stylesheet" href="https://use.typekit.net/ybe1bqw.css" />
        <script defer src="https://stats.kualta.dev/script.js" data-website-id="7bdb552a-61f0-47f6-839e-11a53444dfc0" />
        <script defer src="https://stats.kualta.dev/script.js" data-website-id="42c57186-3cbd-4221-91e1-083ccb710ae8" />
      </head>
      <body
        className={cn(
          "overflow-x-hidden scroll-smooth text-clip bg-background text-foreground min-h-dvh",
        )}
      >
        <Web3Providers>
          <ThemeProvider>
            <SmoothScroll>
              <CookieManager />
              <Toaster position="top-center" offset={16} />
              <Header />
              <Blur />
              {children}
            </SmoothScroll>
          </ThemeProvider>
        </Web3Providers>
      </body>
    </html>
  );
};

export default RootLayout;
