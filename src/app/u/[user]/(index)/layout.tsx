import { getUserProfile } from "@/lib/auth/get-user-profile";
import { getLensClient } from "@/lib/lens/client";
import { fetchAccount } from "@lens-protocol/client/actions";
import { notFound } from "next/navigation";

const UserProfileLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { user: string };
}) => {
  // const lens = await getLensClient();
  // const { handle: userHandle } = await getUserProfile();

 // const profile = await fetchAccount(lens, {username: {localName: userHandle}}) 

 //  if (!profile) {
 //    return notFound();
 //  }

  return (
    <div className="flex flex-col pt-14 md:pt-20 items-center justify-center w-full max-w-full sm:max-w-3xl md:max-w-4xl mx-auto">
      {children}
    </div>
  );
};

export default UserProfileLayout;
