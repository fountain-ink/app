"use client";

import { UserAvatar } from "@/components/user/UserAvatar";
import { useProfile } from "@lens-protocol/react-web";
import { toast } from "sonner";
import { UserBio } from "./UserBio";
import { UserCover } from "./UserCover";
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
				<div className="grow">content</div>
				<div className="grow-0 w-[30%]">
					<div className="-mt-20 ">
						<div className="rounded-full w-fit h-fit ring-4 ring-background">
							<UserAvatar size={150} profile={profile} />
						</div>
					</div>
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
