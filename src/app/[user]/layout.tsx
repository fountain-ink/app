import { UserTheme } from "@/components/user/user-theme";
import { getAuth } from "@/lib/get-auth-clients";
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
  const { lens } = await getAuth();
  const profile = await lens.profile.fetch({
    forHandle: `lens/${params.user}`,
  });

  if (!profile) {
    return notFound();
  }

  return <UserTheme profile={profile}>{children}</UserTheme>;
};

export default UserLayout;
