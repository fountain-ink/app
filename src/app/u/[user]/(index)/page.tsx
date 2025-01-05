import { IndexNavigation } from "@/components/navigation/index-navigation-menu";
import { Separator } from "@/components/ui/separator";
import { AuthorView } from "@/components/user/user-author-view";
import { UserContent } from "@/components/user/user-content";
import { createLensClient } from "@/lib/auth/get-lens-client";
import { getUserProfile } from "@/lib/auth/get-user-profile";
import { getBaseUrl } from "@/lib/get-base-url";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

async function getUserSettings(profileId: string) {
  const url = getBaseUrl();
  const response = await fetch(`${url}/api/users/${profileId}/settings`, {
    cache: "no-store",
    next: { revalidate: 0  }
  });

  if (!response.ok) {
    console.error("Failed to fetch user settings");
    return null;
  }
  const data = await response.json();
  return data.settings;
}

const UserPage = async ({ params }: { params: { user: string } }) => {
  const lens = await createLensClient();
  const { handle: userHandle } = await getUserProfile(lens);
  const pageHandle = `lens/${params.user}`;
  const profile = await lens.profile.fetch({ forHandle: pageHandle });

  if (!profile) {
    return notFound();
  }

  const settings = await getUserSettings(profile.id);
  const showAuthor = settings?.blog?.showAuthor ?? true;
  const showTags = settings?.blog?.showTags ?? true;
  const showTitle = settings?.blog?.showTitle ?? true;
  const blogTitle = settings?.blog?.title;

  const isUserProfile = userHandle === params.user;

  return (
    <>
      {showAuthor && (
        <div className="p-4 ">
          <AuthorView showHandle={false} profiles={[profile]} />
        </div>
      )}
      {showTitle && (
        <div className="text-[1.5rem] sm:text-[2rem] lg:text-[2.5rem] text-center font-[letter-spacing:var(--title-letter-spacing)] font-[family-name:var(--title-font)] font-normal font-[color:var(--title-color)] overflow-hidden line-clamp-2">
          {blogTitle ?? `${profile.handle?.localName}'s blog`}
        </div>
      )}
      <Separator className="w-48 bg-primary mt-3" />
      {showTags && <IndexNavigation username={params.user} isUserProfile={isUserProfile} />}
      <div className="flex flex-col my-4 gap-4">
        <UserContent contentType="articles" profile={profile} isUserProfile={isUserProfile} />
      </div>
    </>
  );
};

export default UserPage;
