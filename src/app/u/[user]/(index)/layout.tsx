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

  if (!profile) {
    return notFound();
  }

  return (
    <div className="flex flex-col pt-20 items-center justify-center w-full max-w-full sm:max-w-3xl md:max-w-4xl mx-auto">
      {children}
    </div>
  );
};

export default UserProfileLayout;
