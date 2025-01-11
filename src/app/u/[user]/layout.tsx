import { UserTheme } from "@/components/user/user-theme";
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

const UserLayout = async ({ children, params }: { children: React.ReactNode; params: { user: string } }) => {
  const lens = await getLensClient();
  let profile = undefined;

  profile = await fetchAccount(lens, { username: { localName: params.user } });
  
  if (profile.isErr()) {
    console.error("Failed to fetch user profile");
    return notFound();
  }

  if (!profile) {
    return notFound();
  }

  return <UserTheme profile={profile}>{children}</UserTheme>;
};

export default UserLayout;
