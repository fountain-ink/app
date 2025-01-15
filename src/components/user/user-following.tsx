import { AccountStats } from "@lens-protocol/client";

export const UserFollowing = ({ stats, className }: { stats?: AccountStats | null; className?: string }) => {
  const following = stats?.graphFollowStats.following;
  const followers = stats?.graphFollowStats.followers;

  return (
    <div className={`${className} flex gap-1`}>
      <b className="text-foreground">{following}</b>
      <span className="text-foreground/65">following</span>

      <b className="ml-2 text-foreground">{followers}</b>
      <span className="text-foreground/65">followers</span>
    </div>
  );
};
