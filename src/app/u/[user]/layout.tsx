import { UserTheme } from "@/components/user/user-theme";
import { createLensClient } from "@/lib/auth/get-lens-client";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: { user: string } }) {
  const handle = params.user;
  const title = `${handle}`;
  return {
    title,
    description: `@${handle} on Fountain`,
  };
}

const UserLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { user: string };
}) => {
  const lens = await createLensClient();
  let profile = undefined;
  try {
    profile = await lens.profile.fetch({
      forHandle: `lens/${params.user}`,
    });
  } catch (error) {
    console.error(error);
  }

  if (!profile) {
    return notFound();
  }

  return <UserTheme profile={profile}>{children}</UserTheme>;
};

export default UserLayout;
