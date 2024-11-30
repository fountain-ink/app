import ErrorPage from "@/components/error-page";
import { UserAvatar } from "@/components/user/user-avatar";
import { UserContent } from "@/components/user/user-content";
import { UserCover } from "@/components/user/user-cover";
import { getAuthWithCookies } from "@/lib/auth/get-auth-clients";

const UserPage = async ({ params }: { params: { user: string } }) => {
  const { lens } = await getAuthWithCookies();
  const pageHandle = `lens/${params.user}`;
  const profile = await lens.profile.fetch({ forHandle: pageHandle });

  if (!profile) {
    return <ErrorPage error="User not found" />;
  }

  return (
    <div className="flex flex-col  ">
      <UserCover className="w-screen md:max-w-[65vw] content-center justify-center" profile={profile} />
      <div className="flex flex-row">
        <div className="transform -translate-y-1/2 flex flex-col items-center justify-center">
          <UserAvatar className="w-40 h-40" profile={profile} />
        </div>
      </div>
      <UserContent contentType="all" profile={profile} />
    </div>
  );
};

export default UserPage;
