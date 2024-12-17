"use client";

import type { ProfileFragment } from "@lens-protocol/client";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Profile } from "@lens-protocol/react-web";

export const UserFollowButton = ({ profile, className }: { profile: ProfileFragment | Profile; className?: string }) => {
  const [following, _setFollowing] = useState(profile.operations.isFollowedByMe.value);
  const followsMe = profile.operations.isFollowingMe.value;
  const _controller = useRef<any>();

  const toggleFollow = async () => {
    return;
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
