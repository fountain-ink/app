import { UserContent } from "@/components/user/user-content";
import { getAuth } from "@/lib/get-auth-clients";

const UserPage = async ({ params }: { params: { user: string } }) => {
  const { lens } = await getAuth();
  const pageHandle = `lens/${params.user}`;
  const profile = await lens.profile.fetch({ forHandle: pageHandle });

  if (!profile) {
    return null;
  }

  return <UserContent contentType="all" profile={profile} />;
};

export default UserPage;
