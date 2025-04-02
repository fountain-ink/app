"use client";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogClose } from "@/components/ui/dialog";
import { Account, Post, PostsQuery, SimpleCollectAction, postId } from "@lens-protocol/client";
import { executePostAction } from "@lens-protocol/client/actions";
import { handleOperationWith } from "@lens-protocol/client/viem";
import { UserAvatar } from "@/components/user/user-avatar";
import { UserName } from "@/components/user/user-name";
import { UserUsername } from "@/components/user/user-handle";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Info, Calendar, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWalletClient } from "wagmi";
import { useState } from "react";
import { getLensClient } from "@/lib/lens/client";
import { toast } from "sonner";

interface CollectAmount {
  value: string;
  asset: {
    symbol: string;
    decimals: number;
  };
}

const formatAmount = (amount: CollectAmount): string => {
  const value = parseFloat(amount.value);
  let formattedValue = value.toFixed(2);
  if (formattedValue.includes('.')) {
    formattedValue = formattedValue.replace(/\.?0+$/, '');
  }
  return `${formattedValue} ${amount.asset.symbol}`;
};

const getTimeRemaining = (endDate: Date): string => {
  const now = new Date();
  const timeRemaining = endDate.getTime() - now.getTime();

  if (timeRemaining <= 0) {
    return "ended";
  }

  const seconds = Math.floor(timeRemaining / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''}`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  } else {
    return `${seconds} second${seconds > 1 ? 's' : ''}`;
  }
};

interface PostCollectProps {
  post: Post;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PostCollect = ({ post, isOpen, onOpenChange }: PostCollectProps) => {
  const { data: walletClient } = useWalletClient();
  const [isCollecting, setIsCollecting] = useState(false);

  const collectAction = post.actions.find(
    (action) => action.__typename === "SimpleCollectAction"
  ) as SimpleCollectAction | undefined;

  if (!collectAction) {
    return null;
  }

  const collectibleMetadata = post.collectibleMetadata;
  const canCollect = post.operations?.canSimpleCollect;

  const imageUrl = collectibleMetadata?.image;
  const amount = collectAction?.payToCollect?.amount;
  const formattedAmount = amount ? formatAmount(amount) : null;
  const totalSupply = collectAction?.collectLimit;
  const currentSupply = post.stats.collects
  const title = "title" in post.metadata ? post.metadata.title : collectibleMetadata?.name;
  const totalValue = amount
    ? formatAmount({
      value: (currentSupply * parseFloat(amount.value)).toString(),
      asset: amount.asset
    })
    : null;

  const endsAt = collectAction?.endsAt ? new Date(collectAction.endsAt) : null;

  const handleCollect = async () => {
    if (!walletClient || !canCollect) return;

    try {
      setIsCollecting(true);
      const lens = await getLensClient();

      if (!lens.isSessionClient()) {
        toast.error("You need to be logged in to collect this post");
        setIsCollecting(false);
        return;
      }

      const result = await executePostAction(lens, {
        post: postId(post.id),
        action: {
          simpleCollect: {
            selected: true,
          },
        },
      }).andThen(handleOperationWith(walletClient as any));

      if (result.isErr()) {
        console.error(result.error);
        toast.error("Failed to collect post");
        setIsCollecting(false);
        return;
      }

      toast.success("Post collected successfully");
      onOpenChange(false);
    } catch (error) {
      console.error("Error collecting post:", error);
      toast.error("An error occurred while collecting the post", {
        description: error as string,
      });
    } finally {
      setIsCollecting(false);
    }
  };

  return (
    <Dialog modal={true} open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md gap-4">

        <DialogHeader className="p-0 space-y-0">
          <DialogTitle className="absolute -left-[9999px]">Collect Post</DialogTitle>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Collect</h2>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-4 ">
          <div className="flex items-center gap-2">
            <div className="flex flex-row items-center gap-2">
              <UserAvatar account={post.author} className="w-12 h-12" />
              <div className="flex flex-col">
                <UserName className="text-base" profile={post.author} />
                <UserUsername account={post.author} />
              </div>
            </div>
          </div>
        </div>

        {title && (
          <h3 className="text-lg font-medium">{title}</h3>
        )}

        {imageUrl && (
          <div className="relative aspect-square w-full overflow-hidden rounded-lg">
            <Image src={imageUrl} alt={collectibleMetadata?.name ?? "Post image"} layout="fill" objectFit="cover" />
          </div>
        )}

        <h3 className="text-lg font-medium">{collectibleMetadata?.name}</h3>

        {collectibleMetadata?.description && (
          <p className="text-sm text-muted-foreground">{collectibleMetadata.description}</p>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Sold</p>
            <p>{currentSupply}{totalSupply ? `/${totalSupply}` : ''} {totalValue && `(${totalValue} total)`}</p>
          </div>
          <div>
            <p className="text-muted-foreground flex items-center gap-1">License <Info size={12} /></p>
            <p>Commercial rights for collector</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 text-sm">
          {endsAt && (
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-muted-foreground" />
              <span className="flex items-center gap-1">
                Collection ends in {getTimeRemaining(endsAt)}
                <div className="relative group">
                  <Info size={12} className="text-muted-foreground cursor-help" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 hidden group-hover:block bg-popover text-popover-foreground px-2 py-1 rounded text-xs whitespace-nowrap shadow-md z-10">
                    {endsAt.toLocaleDateString()} at {endsAt.toLocaleTimeString()} (current timezone)
                  </div>
                </div>
              </span>
            </div>
          )}

          {/* {followerOnly && (
            <div className="flex items-center gap-2">
              <Users size={16} className="text-muted-foreground" />
              <span>Only followers can collect</span>
            </div>
          )}

          {referralFee !== undefined && referralFee > 0 && (
            <div className="flex items-center gap-2">
              <Info size={16} className="text-muted-foreground" />
              <span>{referralFee}% referral fee</span>
            </div>
          )} */}
        </div>

        {formattedAmount && (
          <Button
            disabled={!canCollect || !amount || isCollecting}
            onClick={handleCollect}
            className="w-full"
            size="lg"
          >
            {isCollecting ? "Collecting..." : canCollect ? `Collect for ${formattedAmount}` : "Cannot collect"}
          </Button>
        )}
        {!amount && <p className="text-sm text-center text-muted-foreground">Collect details not available.</p>}
      </DialogContent>
    </Dialog >
  );
};
