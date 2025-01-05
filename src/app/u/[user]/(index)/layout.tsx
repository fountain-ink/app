import { createLensClient } from "@/lib/auth/get-lens-client";
import { getUserProfile } from "@/lib/auth/get-user-profile";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const UserProfileLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { user: string };
}) => {
  const lens = await createLensClient();
  const { handle: userHandle } = await getUserProfile(lens);

  const profile = await lens.profile.fetch({
    forHandle: `lens/${params.user}`,
  });

  if (!profile) {
    return notFound();
  }

  return (
    <div className="flex flex-col pt-14 md:pt-20 items-center justify-center w-full max-w-full sm:max-w-3xl md:max-w-4xl mx-auto">
      {children}
    </div>
  );
};

export default UserProfileLayout;
