"use client";

import type { Account } from "@lens-protocol/client";
import { follow, unfollow } from "@lens-protocol/client/actions";
import { handleOperationWith } from "@lens-protocol/client/viem";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useWalletClient } from "wagmi";
import { useReconnectWallet } from "@/hooks/use-reconnect-wallet";
import { getLensClient } from "@/lib/lens/client";
import { Button } from "../ui/button";

export const UserFollowButton = ({ account, className }: { account: Account; className?: string }) => {
  const [following, setFollowing] = useState(() => !!account.operations?.isFollowedByMe);
  const [isPending, setIsPending] = useState(false);
  const { data: walletClient } = useWalletClient();
  const reconnectWallet = useReconnectWallet();
  const router = useRouter();

  const toggleFollow = async () => {
    try {
      const lens = await getLensClient();

      if (!lens.isSessionClient()) {
        toast.error("Please connect your wallet first");
        return;
      }

      if (!walletClient) {
        reconnectWallet();
        toast.error("Please connect your wallet first");
        return;
      }

      if (!following) {
        if (account.operations?.canFollow.__typename === "AccountFollowOperationValidationFailed") {
          toast.error(`Cannot follow: ${account.operations.canFollow.reason}`);
          return;
        }

        if (account.operations?.canFollow.__typename === "AccountFollowOperationValidationUnknown") {
          toast.error("Cannot follow: Unknown validation rules");
          return;
        }
      }

      setIsPending(true);

      let actionResult: any;
      if (following) {
        actionResult = await unfollow(lens, {
          account: account.address,
        })
          .andThen(handleOperationWith(walletClient as any))
          .andThen(lens.waitForTransaction);
      } else {
        actionResult = await follow(lens, {
          account: account.address,
        })
          .andThen(handleOperationWith(walletClient as any))
          .andThen(lens.waitForTransaction);
      }

      if (actionResult.isErr()) {
        console.error("Failed to follow:", actionResult.error);
        toast.error(following ? "Failed to unfollow account" : "Failed to follow account");
        return;
      }

      const newFollowingState = !following;
      setFollowing(newFollowingState);
      toast.success(
        `${newFollowingState ? "Followed" : "Unfollowed"} ${account.username?.localName || "account"} successfully`,
      );

      router.refresh();
    } catch (error) {
      console.error("Error following account:", error);
      toast.error("Failed to update follow status");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <div className="items-center cursor-pointer justify-center">
        <Button
          size="default"
          variant={following ? "outline" : "default"}
          onClick={() => toggleFollow()}
          disabled={isPending}
          className={`text-sm right-0 top-0 ${className}`}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {following ? "Unfollowing" : "Following"}
            </>
          ) : following ? (
            "Following"
          ) : account.operations?.isFollowingMe ? (
            "Follow back"
          ) : (
            "Follow"
          )}
        </Button>
      </div>
    </>
  );
};
