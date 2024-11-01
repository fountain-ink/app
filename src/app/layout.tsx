import { CookieManager } from "@/components/auth/cookie-manager";
import { Blur } from "@/components/navigation/gradient-blur";
import { Header } from "@/components/navigation/header";
import { SmoothScroll } from "@/components/smooth-scroll";
import { ThemeProvider } from "@/components/theme/theme-context";
import { Toaster } from "@/components/ui/sonner";
import { Web3Providers } from "@/components/web3-providers";

import "@/styles/globals.css";

export const metadata = {
  title: "Fountain",
  description: "where your writing journey begins...",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <head>
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8"/>
        <link rel="stylesheet" href="https://use.typekit.net/ybe1bqw.css"/>
        <script defer src="https://stats.pingpad.io/script.js" data-website-id="544f8064-8484-4ff4-9553-94ba54a8be12"/>
        <script defer src="https://stats.pingpad.io/script.js" data-website-id="8e92ba2d-871c-4ebf-b339-e2931b8d6bed"/>
      </head>
      <body>
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
