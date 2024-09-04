import type { Profile, ProfileFragment } from "@lens-protocol/client";
import { UserAvatar } from "./UserAvatar";
import { UserBio } from "./UserBio";
import { UserFollowing } from "./UserFollowing";
import { UserHandle } from "./UserHandle";
import { UserName } from "./UserName";
import { UserSocials } from "./UserSocials";

export const UserProfile = ({
	profile,
}: { profile?: Profile | ProfileFragment }) => {
	return (
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
	);
};
