import { AuthManager } from "@/components/auth/auth-manager";
import { Web3Providers } from "@/components/misc/web3-providers";
import { Header } from "@/components/navigation/header";
import { GlobalFooter } from "@/components/navigation/global-footer";
import { ThemeProvider } from "@/components/theme/theme-context";
import { Toaster } from "@/components/ui/sonner";
import { getSession } from "@/lib/auth/get-session";
import { getLensClient } from "@/lib/lens/client";
import "@/styles/globals.css";
import { cn } from "@udecode/cn";
import { PlateController } from "@udecode/plate/react";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { ThemeProvider as DarkModeProvider } from "next-themes";
import { PostActionsProvider } from "@/contexts/post-actions-context";

export const metadata = {
  title: "Fountain",
  description: "where your writing journey begins...",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  const client = await getLensClient();
  const session = await getSession();
  const credentials = client.isSessionClient() ? client.getCredentials().unwrapOr(null) : null;

  return (
    <html lang="en" suppressHydrationWarning className={cn(GeistSans.variable, GeistMono.variable)}>
      <head>
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <link rel="stylesheet" href="https://use.typekit.net/ybe1bqw.css" />
        <script defer src="https://stats.kualta.dev/script.js" data-website-id="42c57186-3cbd-4221-91e1-083ccb710ae8" />
      </head>
      <body
        data-plate-selectable
        className={cn(
          "overflow-x-hidden scroll-smooth text-clip bg-background text-foreground min-h-dvh flex flex-col",
          "[&_.slate-selection-area]:border [&_.slate-selection-area]:border-primary [&_.slate-selection-area]:bg-primary/10 ",
        )}
      >
        <Web3Providers>
          <PostActionsProvider>
            <DarkModeProvider attribute="class" defaultTheme="system" enableSystem={true} disableTransitionOnChange>
              <ThemeProvider>
                <AuthManager credentials={credentials} />
                <Toaster position="top-center" offset={16} />
                <Header session={session} />
                <main className="flex-1">{children}</main>
                <GlobalFooter />
              </ThemeProvider>
            </DarkModeProvider>
          </PostActionsProvider>
        </Web3Providers>
      </body>
    </html>
  );
};

export default RootLayout;
