"use client";

import type { Account } from "@lens-protocol/client";
import { useState } from "react";
import { Button } from "../ui/button";

export const UserFollowButton = ({ profile, className }: { profile: Account; className?: string }) => {
  const [following, _setFollowing] = useState(profile.operations?.isFollowedByMe);
  const followsMe = profile.operations?.isFollowingMe;

  const toggleFollow = async () => {
    return;
    //// FIXME: Implement follow/unfollow
    // const followingNow = !following;
    // setFollowing(!following);

    // if (followingNow) {
    //   shootEffect();
    // }

    // const result = await fetch(`/api/user/${profile.id}/follow`, {
    //   method: "POST",
    // });

    // if (!result.ok) {
    //   toast.error(`${followingNow ? "Follow" : "Unfollow"} action failed: ${result.statusText} `);
    //   setFollowing(!following);
    // } else {
    //   toast.success(`${followingNow ? "Followed" : "Unfollowed"} Successfully!`, { description: "Finalized on-chain" });
    // }
  };

  return (
    <>
      <div className="items-center justify-center">
        <Button
          size="default"
          variant={following ? "outline" : "default"}
          onClick={() => toggleFollow()}
          className={`text-sm right-0 top-0 ${className}`}
        >
          {following ? "Following" : followsMe ? "Follow back" : "Follow"}
        </Button>
      </div>
    </>
  );
};
