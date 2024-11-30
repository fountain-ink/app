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
    <div className="flex flex-col items-center justify-center w-[100%] md:w-[80%] lg:w-[60%] mx-auto">{children}</div>
  );
};

export default UserProfileLayout;
