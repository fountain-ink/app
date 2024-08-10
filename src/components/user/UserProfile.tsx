"use client";

import { UserAvatar } from "@/components/user/UserAvatar";
import { useProfile } from "@lens-protocol/react-web";
import { toast } from "sonner";
import { UserBio } from "./UserBio";
import { UserContent } from "./UserContent";
import { UserCover } from "./UserCover";
import { UserFollowing } from "./UserFollowing";
import { UserHandle } from "./UserHandle";
import { UserName } from "./UserName";
import { UserSocials } from "./UserSocials";

export const UserProfile = ({ user }: { user: string }) => {
	const handle = `lens/${user}`;
	const { data: profile, loading, error } = useProfile({ forHandle: handle });

	if (loading) {
		return <ProfileSuspense />;
	}

	if (error) {
		toast.error(error.message);
		return null;
	}

	return (
		<div className="flex flex-col items-center justify-center w-[100%] sm:w-[70%] mx-auto">
			<UserCover profile={profile} />
			<div className="flex flex-row w-full">
				<div className="grow w-[70%]">
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

const ProfileSuspense = () => {
	return (
		<div className="flex flex-col items-center justify-center w-[100%] sm:w-[70%] mx-auto">
			<div className="w-full h-48 bg-muted animate-pulse rounded-b-lg" />{" "}
			{/* UserCover placeholder */}
			<div className="flex flex-row w-full">
				<div className="grow w-[70%] p-4">
					<div className="space-y-4">
						{[1, 2, 3].map((i) => (
							<div key={i} className="flex flex-col space-y-2">
								<div className="h-4 bg-muted animate-pulse rounded w-3/4" />
								<div className="h-4 bg-muted animate-pulse rounded w-1/2" />
							</div>
						))}
					</div>
				</div>
				<div className="w-[30%]">
					<div className="sticky top-24 right-0 h-fit">
						<div className="rounded-full bg-muted animate-pulse w-[100%] sm:w-[60%] h-auto aspect-square -translate-y-1/2" />{" "}
						{/* UserAvatar placeholder */}
						<div className="-mt-[25%] space-y-4">
							<div className="h-6 bg-muted animate-pulse rounded w-3/4" />{" "}
							{/* UserName placeholder */}
							<div className="h-4 bg-muted animate-pulse rounded w-1/2" />{" "}
							{/* UserHandle placeholder */}
							<div className="h-4 bg-muted animate-pulse rounded w-full" />{" "}
							{/* UserFollowing placeholder */}
							<div className="space-y-2">
								{" "}
								{/* UserBio placeholder */}
								<div className="h-4 bg-muted animate-pulse rounded w-full" />
								<div className="h-4 bg-muted animate-pulse rounded w-3/4" />
							</div>
							<div className="flex space-x-2">
								{" "}
								{/* UserSocials placeholder */}
								{[1, 2, 3].map((i) => (
									<div
										key={i}
										className="w-8 h-8 bg-muted animate-pulse rounded-full"
									/>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
