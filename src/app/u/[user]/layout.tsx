import { UserCover } from "@/components/user/UserCover";
import { UserNavigation } from "@/components/user/UserNavigation";
import { UserProfile } from "@/components/user/UserProfile";
import { getAuthorizedClients } from "@/lib/getAuthorizedClients";
import { notFound } from "next/navigation";

export async function generateMetadata({
	params,
}: { params: { user: string } }) {
	const handle = params.user;
	const title = `${handle}`;
	return {
		title,
		description: `@${handle} on Fountain`,
	};
}

const UserLayout = async ({
	children,
	params,
}: {
	children: React.ReactNode;
	params: { user: string };
}) => {
	const { lens, handle: userHandle } = await getAuthorizedClients();
	const profile = await lens.profile.fetch({
		forHandle: `lens/${params.user}`,
	});
	const isUserProfile = userHandle === params.user;

	if (!profile) {
		return notFound();
	}

	return (
		<div className="flex flex-col items-center justify-center w-[100%] sm:w-[70%] mx-auto">
			<UserCover profile={profile} />
			<div className="flex flex-row w-full">
				<div className="grow w-[70%] flex-col gap-8">
					<h1 className="text-4xl font-bold p-4">
						{profile?.handle?.localName}'s blog
					</h1>
					<UserNavigation
						username={params.user}
						isUserProfile={isUserProfile}
					/>
					<div className="flex flex-col gap-4 p-4">{children}</div>
				</div>
				<div className="w-[30%] p-4">
					<UserProfile profile={profile} />
				</div>
			</div>
		</div>
	);
};

export default UserLayout;
