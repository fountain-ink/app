import { SlideNav } from "@/components/ui/slide-tabs";
import { getAppToken } from "@/lib/auth/get-app-token";
import { getTokenClaims } from "@/lib/auth/get-token-claims";

export const FeedNavigation = () => {
  const token = getAppToken();
  const claims = getTokenClaims(token);
  const isLoggedIn = !!claims && claims.metadata?.isAnonymous === false;

  return (
    <div className="p-4 pb-0 font-[family-name:var(--title-font)] border-b border-border w-full max-w-3xl">
      <SlideNav
        items={[
          {
            href: "/featured",
            label: "Featured",
          },
          {
            href: "/home",
            label: "Latest",
          },
          {
            href: "/bookmarks",
            label: "Bookmarks",
            isVisible: isLoggedIn,
          },
        ]}
        className="w-fit"
      />
    </div>
  );
};
