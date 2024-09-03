import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user/UserAvatar";
import { UserBio } from "@/components/user/UserBio";
import { UserContent } from "@/components/user/UserContent";
import { UserCover } from "@/components/user/UserCover";
import { UserFollowing } from "@/components/user/UserFollowing";
import { UserHandle } from "@/components/user/UserHandle";
import { UserName } from "@/components/user/UserName";
import { UserSocials } from "@/components/user/UserSocials";
import { getAuthorizedClients } from "@/lib/getAuthorizedClients";
import Link from "next/link";
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

const user = async ({ params }: { params: { user: string } }) => {
	const { lens, profileId: userProfileId } = await getAuthorizedClients();

	const pageHandle = `lens/${params.user}`;

	const profile = await lens.profile.fetch({ forHandle: pageHandle });

	if (!profile) {
		return notFound();
	}

	const isUserProfile = profile.id === userProfileId;

	return (
		<div className="flex flex-col items-center justify-center w-[100%] sm:w-[70%] mx-auto">
			<UserCover profile={profile} />
			<div className="flex flex-row w-full">
				<div className="grow w-[70%] flex-col gap-8">
					<h1 className="text-4xl font-bold p-4">
						{profile?.handle?.localName}'s blog
					</h1>
					<div className="flex flex-row gap-4">
						<Link href={`/u/${params.user}`}>
							<Button variant="ghost" className="text-lg">
								Published
							</Button>
						</Link>

						{isUserProfile && (
							<Link href={`/u/${params.user}/drafts`}>
								<Button variant="ghost" className="text-lg">
									Drafts
								</Button>
							</Link>
						)}

						<Link href={`/u/${params.user}/all`}>
							<Button variant="ghost" className="text-lg">
								All
							</Button>
						</Link>
					</div>
					<UserContent profile={profile} />
				</div>
				<div className="w-[30%] p-4">
					<div className="sticky top-32 right-0 h-fit">
						<UserAvatar
							className="rounded-full ring-4 ring-background w-[100%] sm:w-[60%] h-auto aspect-square -translate-y-1/2"
							profile={profile}
						/>
						<div className="-mt-[25%]">
							<UserName profile={profile} />
							<div className="mb-2">
								<UserHandle profile={profile} />
							</div>
							<UserFollowing profile={profile} />
							<UserBio profile={profile} />
							<UserSocials profile={profile} />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default user;
