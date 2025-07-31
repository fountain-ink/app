import { AuthManager } from "@/components/auth/auth-manager";
import { Web3Providers } from "@/components/misc/web3-providers";
import { GlobalFooter } from "@/components/navigation/global-footer";
import { Header } from "@/components/navigation/header";
import { ThemeProvider } from "@/components/theme/theme-context";
import { Toaster } from "@/components/ui/sonner";
import { getSession } from "@/lib/auth/get-session";
import { getLensClient } from "@/lib/lens/client";
import "@/styles/globals.css";
import { cn } from "@udecode/cn";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { Libre_Baskerville } from "next/font/google";
import { ThemeProvider as DarkModeProvider } from "next-themes";
import { GlobalModals } from "@/components/misc/global-modals";
import { NotificationsProvider } from "@/components/notifications/notifications-context";
import { FeedProvider } from "@/contexts/feed-context";
import { PostActionsProvider } from "@/contexts/post-actions-context";

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-libre-baskerville",
});

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
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(GeistSans.variable, GeistMono.variable, libreBaskerville.variable)}
    >
      <head>
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
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
            <FeedProvider>
              <DarkModeProvider attribute="class" defaultTheme="system" enableSystem={true} disableTransitionOnChange>
                <ThemeProvider>
                  <NotificationsProvider>
                    <AuthManager credentials={credentials} />
                    <Toaster position="top-center" offset={16} />
                    <Header session={session} />
                    <GlobalModals />
                    <main className="flex-1">{children}</main>
                    <GlobalFooter />
                  </NotificationsProvider>
                </ThemeProvider>
              </DarkModeProvider>
            </FeedProvider>
          </PostActionsProvider>
        </Web3Providers>
      </body>
    </html>
  );
};

export default RootLayout;
