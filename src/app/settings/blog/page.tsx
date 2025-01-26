import { BlogSettings } from "@/components/settings/settings-blog";
import { getAppToken } from "@/lib/auth/get-app-token";
import { getTokenClaims } from "@/lib/auth/get-token-claims";
import { getUserMetadata } from "@/lib/settings/get-user-metadata";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Blog Settings",
};

export default async function BlogSettingsPage() {
  const appToken = getAppToken();
  const claims = getTokenClaims(appToken);

  if (!claims) {
    return notFound();
  }

  const settings = await getUserMetadata(claims.sub);

  return <BlogSettings initialSettings={settings ?? {}} />;
}
