import { UserTheme } from "@/components/user/user-theme";
import { getBaseUrl } from "@/lib/get-base-url";
import { getLensClient } from "@/lib/lens/client";
import { fetchAccount } from "@lens-protocol/client/actions";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: { user: string } }) {
  const handle = params.user;
  const title = `${handle}`;
  return {
    title,
    description: `@${handle} on Fountain`,
  };
}

async function getUserSettings(address: string) {
  const url = getBaseUrl();
  const response = await fetch(`${url}/api/users/${address}/settings`, {
    cache: "no-store",
  });

  if (!response.ok) {
    console.error("Failed to fetch user settings");
    return null;
  }
  const data = await response.json();
  return data.settings;
}

const UserLayout = async ({ children, params }: { children: React.ReactNode; params: { user: string } }) => {
  const lens = await getLensClient();
  let profile = undefined;

  profile = await fetchAccount(lens, { username: { localName: params.user } }).unwrapOr(null);

  if (!profile) {
    console.error("Failed to fetch user profile");
    return notFound();
  }

  const settings = await getUserSettings(profile.address);
  const themeName = settings?.theme?.name;

  return <UserTheme initialTheme={themeName}>{children}</UserTheme>;
};

export default UserLayout;
