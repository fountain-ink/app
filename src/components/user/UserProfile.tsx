"use client";

import { UserAvatar } from "@/components/user/UserAvatar";
import { useProfile } from "@lens-protocol/react-web";
import { toast } from "sonner";
import { UserBio } from "./UserBio";
import { UserCover } from "./UserCover";
import { UserFollowing } from "./UserFollowing";
import { UserHandle } from "./UserHandle";
import { UserName } from "./UserName";
import { UserSocials } from "./UserSocials";

export const UserProfile = ({ user }: { user: string }) => {
	const handle = `lens/${user}`;
	const { data: profile, loading, error } = useProfile({ forHandle: handle });

	if (loading) {
		return <UserSuspense />;
	}

	if (error) {
		toast.error(error.message);
		return null;
	}

	const cover =
		profile?.metadata?.coverPicture?.optimized ||
		profile?.metadata?.coverPicture?.raw;

	if (!cover) {
		return <div className="w-full h-48 bg-muted" />;
	}

	return (
		<div className="flex flex-col">
			<UserCover profile={profile} />
			<div className="flex flex-row">
				<div className="grow min-h-[2000px]">content</div>
				<div className="grow-0 w-[30%] h-fit sticky -translate-y-[60%] ">
					<UserAvatar
						className="rounded-full ring-4 ring-background w-[100%] sm:w-[60%] h-auto aspect-square"
						profile={profile}
					/>
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
	);
};

const UserSuspense = () => {
	return (
		<div className="flex h-4 w-96 items-center justify-center rounded-full bg-muted" />
	);
};
