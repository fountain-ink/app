import { AuthorView } from "@/components/user/user-author-view";
import { UserNavigation } from "@/components/user/user-navigation";
import { getAuthWithCookies } from "@/lib/auth/get-auth-clients";
import { notFound } from "next/navigation";

const UserProfileLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { user: string };
}) => {
  const { lens, handle: userHandle } = await getAuthWithCookies();
  const profile = await lens.profile.fetch({
    forHandle: `lens/${params.user}`,
  });

  const isUserProfile = userHandle === params.user;

  if (!profile) {
    return notFound();
  }

  return (
    <div className="flex lg:px-8 xl:px-20 py-20 xl:py-28 flex-col items-center justify-center w-[100%] md:w-[80%] lg:w-[60%] mx-auto">
      <div className="flex flex-col items-center justify-center max-w-[100%] sm:max-w-[90%] md:max-w-[80%] lg:max-w-[600px] mx-auto">
        <div className="p-4 font-[letter-spacing:var(--title-letter-spacing)] font-[family-name:var(--title-font)] font-[var(--title-weight)] font-[color:var(--title-color)] line-clamp-2">
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
      <div className="flex flex-col mt-4 gap-4">{children}</div>
    </div>
  );
};

export default UserProfileLayout;
