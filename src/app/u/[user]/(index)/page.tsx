import { UserContent } from "@/components/user/user-content";
import { getAuthWithCookies } from "@/lib/auth/get-auth-clients";

import { AuthorView } from "@/components/user/user-author-view";
import { UserNavigation } from "@/components/user/user-navigation";
import { notFound } from "next/navigation";

const UserPage = async ({ params }: { params: { user: string } }) => {
  const { lens, handle: userHandle } = await getAuthWithCookies();
  const pageHandle = `lens/${params.user}`;
  const profile = await lens.profile.fetch({ forHandle: pageHandle });

  if (!profile) {
    return notFound();
  }

  const isUserProfile = userHandle === params.user;

  return (
    <>
      <div className="flex flex-col items-center justify-center max-w-[100%] sm:max-w-[90%] md:max-w-[80%] lg:max-w-[600px] mx-auto">
        <div className="p-4 ">
          {/* <div className="text-4xl p-4 font-[letter-spacing:var(--title-letter-spacing)] font-[family-name:var(--title-font)] font-[var(--title-weight)] font-[color:var(--title-color)] line-clamp-2">
          {profile?.handle?.localName} blog
        </div> */}
          <AuthorView showHandle={false} profiles={[profile]} />
        </div>
        <div className="text-[1.5rem] sm:text-[2rem] lg:text-[2.5rem] text-center font-[letter-spacing:var(--title-letter-spacing)] font-[family-name:var(--title-font)] font-normal font-[color:var(--title-color)] overflow-hidden line-clamp-2">
          The Adventures of Modern Day Jules Verne
        </div>
        <UserNavigation username={params.user} isUserProfile={isUserProfile} />
      </div>
      <div className="flex flex-col mt-4 gap-4">
        <UserContent contentType="articles" profile={profile} />
      </div>
    </>
  );
};

export default UserPage;
