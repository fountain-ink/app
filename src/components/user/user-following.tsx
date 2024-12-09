import type { ProfileFragment } from "@lens-protocol/client";
import type { Profile } from "@lens-protocol/react-web";

export const UserFollowing = ({ profile }: { profile?: Profile | ProfileFragment }) => {
  const following = profile?.stats.following;
  const followers = profile?.stats.followers;

  if (!following || !followers) {
    return null;
  }

  return (
    <div className="text-foreground text-lg">
      <b>{following}</b> following <b className="ml-2">{followers}</b> followers
    </div>
  );
};
