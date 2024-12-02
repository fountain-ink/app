import { UserContent } from "@/components/user/user-content";
import { getAuthWithCookies } from "@/lib/auth/get-auth-clients";

import { IndexNavigation } from "@/components/navigation/index-navigation";
import { Separator } from "@/components/ui/separator";
import { AuthorView } from "@/components/user/user-author-view";
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
      <div className="p-4 ">
        <AuthorView showHandle={false} profiles={[profile]} />
      </div>
      <div className="text-[1.5rem] sm:text-[2rem] lg:text-[2.5rem] text-center font-[letter-spacing:var(--title-letter-spacing)] font-[family-name:var(--title-font)] font-normal font-[color:var(--title-color)] overflow-hidden line-clamp-2">
        The Adventures of Modern Day Jules Verne
      </div>
      <Separator className="w-48 bg-primary mt-3" />
      <IndexNavigation username={params.user} isUserProfile={isUserProfile} />
      <div className="flex flex-col my-4 gap-4">
        <UserContent contentType="articles" profile={profile} isUserProfile={isUserProfile} />
      </div>
    </>
  );
};

export default UserPage;
