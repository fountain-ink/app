import type { ProfileFragment } from "@lens-protocol/client";
import type { Profile } from "@lens-protocol/react-web";
import { UserAvatar } from "./user-avatar";
import { UserBio } from "./user-bio";
import { UserFollowing } from "./user-following";
import { UserHandle } from "./user-handle";
import { UserName } from "./user-name";
import { UserSocials } from "./user-socials";

export const UserProfile = ({ profile }: { profile?: Profile | ProfileFragment }) => {

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
