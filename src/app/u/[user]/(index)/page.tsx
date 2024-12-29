import { IndexNavigation } from "@/components/navigation/index-navigation-menu";
import { Separator } from "@/components/ui/separator";
import { AuthorView } from "@/components/user/user-author-view";
import { UserContent } from "@/components/user/user-content";
import { getLensClientWithCookies } from "@/lib/auth/get-lens-client";
import { getUserProfile } from "@/lib/auth/get-user-profile";
import { notFound } from "next/navigation";

const UserPage = async ({ params }: { params: { user: string } }) => {
  const lens = await getLensClientWithCookies();
  const { handle: userHandle } = await getUserProfile(lens);
  const pageHandle = `lens/${params.user}`;
  const profile = await lens.profile.fetch({ forHandle: pageHandle });
  const title = profile?.metadata?.attributes?.find((item) => item.key === "blogTitle");
  const showAuthor =
    profile?.metadata?.attributes?.find((item) => item.key === "showAuthor")?.value !== "false" ?? true;
  const showTags = profile?.metadata?.attributes?.find((item) => item.key === "showTags")?.value !== "false" ?? true;
  const showTitle = profile?.metadata?.attributes?.find((item) => item.key === "showTitle")?.value !== "false" ?? true;

  if (!profile) {
    return notFound();
  }

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
          {title?.value ?? `${profile.handle?.localName}'s blog`}
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
