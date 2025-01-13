import { AccountStats } from "@lens-protocol/client";

export const UserFollowing = ({ stats }: { stats?: AccountStats | null }) => {
  const following = stats?.graphFollowStats.following;
  const followers = stats?.graphFollowStats.followers;

  if (!following || !followers) {
    return null;
  }

  return (
    <div className="">
      <b>{following}</b> following <b className="ml-2">{followers}</b> followers
    </div>
  );
};
