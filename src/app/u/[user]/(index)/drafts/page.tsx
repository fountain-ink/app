import { CloudDraftsList } from "@/components/draft/draft-list-cloud";
import ErrorPage from "@/components/error-page";
import { IndexNavigation } from "@/components/navigation/index-navigation";
import { Separator } from "@/components/ui/separator";
import { AuthorView } from "@/components/user/user-author-view";
import { getAuthWithCookies } from "@/lib/auth/get-auth-clients";
import { notFound } from "next/navigation";

// FIXME: Stop downloading the entirety of draft content for drafts list
export const maxDuration = 60;

const UserPage = async ({ params }: { params: { user: string } }) => {
  const { lens, handle: userHandle, profileId } = await getAuthWithCookies();
  const pageHandle = `lens/${params.user}`;
  const profile = await lens.profile.fetch({ forHandle: pageHandle });

  if (!profile) {
    return notFound();
  }

  if (params.user !== userHandle) {
    return <ErrorPage error="Can't access other user's drafts" />;
  }

  const isUserProfile = userHandle === params.user;

  return (
    <>
      <div className="p-4 ">
        <AuthorView showHandle={false} profiles={[profile]} />
      </div>
      <div className="text-[1.5rem] sm:text-[2rem] lg:text-[2.5rem] text-center font-[letter-spacing:var(--title-letter-spacing)] font-[family-name:var(--title-font)] font-normal font-[color:var(--title-color)] overflow-hidden line-clamp-2">
        Drafts
      </div>
      <Separator className="w-48 bg-primary mt-3" />
      <IndexNavigation username={params.user} isUserProfile={isUserProfile} />
      <div className="flex flex-col my-4 gap-4">
        <CloudDraftsList profileId={profileId} />
      </div>
    </>
  );
};

export default UserPage;
