"use client";

import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { TruncatedText } from "@/components/misc/truncated-text";
import { UserAvatar } from "@/components/user/user-avatar";
import { UserName } from "@/components/user/user-name";
import { cn } from "@/lib/utils";
import { 
  UserPlus, 
  AtSign, 
  MessageCircle, 
  Quote, 
  Repeat2, 
  Heart, 
  Sparkles,
  Bell,
  Coins,
  ShoppingBag,
  HelpCircle,
  Gift
} from "lucide-react";

interface NotificationViewProps {
  notification: any; // Lens Protocol notification type
  onRead?: () => void;
}

const getActionType = (action: any): "tipping" | "collecting" | "unknown" => {
  // Check if it's a tipping action
  if (action.__typename === "TippingPostActionExecuted" || action.__typename === "TippingAccountActionExecuted") {
    return "tipping";
  }
  // Check if it's a collecting action
  if (action.__typename === "SimpleCollectPostActionExecuted") {
    return "collecting";
  }
  // Check for action property that might indicate type
  if (action.action?.address) {
    // You might need to check against known contract addresses or other indicators
    return "unknown";
  }
  return "unknown";
};

const formatAmount = (amount: any): string | null => {
  if (!amount) return null;
  
  // Handle ERC20 amounts
  if (amount.amount && amount.asset) {
    const value = parseFloat(amount.amount);
    const symbol = amount.asset.symbol || "tokens";
    return `${value} ${symbol}`;
  }
  
  // Handle native amounts
  if (amount.value && amount.currency) {
    const value = parseFloat(amount.value);
    return `${value} ${amount.currency}`;
  }
  
  return null;
};

const getNotificationAmount = (notification: any): string | null => {
  switch (notification.__typename) {
    case "PostActionExecutedNotification":
    case "AccountActionExecutedNotification":
      if (notification.actions?.[0]) {
        const action = notification.actions[0];
        // For tipping actions
        if (action.tipAmount) {
          return formatAmount(action.tipAmount);
        }
        // For other actions that might have amounts
        if (action.amount) {
          return formatAmount(action.amount);
        }
      }
      return null;
    case "TokenDistributedNotification":
      if (notification.amount) {
        return formatAmount(notification.amount);
      }
      return null;
    default:
      return null;
  }
};

const getNotificationIcon = (type: string, notification?: any) => {
  switch (type) {
    case "FollowNotification":
      return UserPlus;
    case "MentionNotification":
      return AtSign;
    case "CommentNotification":
      return MessageCircle;
    case "QuoteNotification":
      return Quote;
    case "RepostNotification":
      return Repeat2;
    case "ReactionNotification":
      return Heart;
    case "TokenDistributedNotification":
      return Gift;
    case "PostActionExecutedNotification":
    case "AccountActionExecutedNotification":
      // Check the first action to determine icon
      if (notification?.actions?.[0]) {
        const actionType = getActionType(notification.actions[0]);
        switch (actionType) {
          case "tipping":
            return Coins;
          case "collecting":
            return ShoppingBag;
          default:
            return HelpCircle;
        }
      }
      return Sparkles;
    default:
      return Bell;
  }
};

const getNotificationMessage = (notification: any): string => {
  switch (notification.__typename) {
    case "FollowNotification": {
      const followCount = notification.followers?.length || 0;
      return followCount > 1 ? `and ${followCount - 1} others followed you` : "followed you";
    }
    case "MentionNotification":
      return "mentioned you";
    case "CommentNotification":
      return "commented on your post";
    case "QuoteNotification":
      return "quoted your post";
    case "RepostNotification":
      return "reposted your post";
    case "ReactionNotification":
      return "liked your post";
    case "PostActionExecutedNotification":
      if (notification.actions?.[0]) {
        const actionType = getActionType(notification.actions[0]);
        switch (actionType) {
          case "tipping":
            return "tipped your post";
          case "collecting":
            return "collected your post";
          default:
            return "performed an action on your post";
        }
      }
      return "performed an action on your post";
    case "AccountActionExecutedNotification":
      if (notification.actions?.[0]) {
        const actionType = getActionType(notification.actions[0]);
        switch (actionType) {
          case "tipping":
            return "sent you a tip";
          default:
            return "performed an action";
        }
      }
      return "performed an action";
    case "TokenDistributedNotification":
      return "distributed tokens to you";
    default:
      return "interacted with you";
  }
};

const getNotificationLink = (notification: any): string => {
  switch (notification.__typename) {
    case "FollowNotification":
      if (notification.followers?.[0]) {
        const follower = notification.followers[0];
        return `/u/${follower.account?.username?.localName || follower.account?.address || "unknown"}`;
      }
      return "/notifications";
    case "MentionNotification":
    case "CommentNotification":
    case "QuoteNotification":
    case "RepostNotification":
    case "ReactionNotification":
      if (notification.post) {
        return `/p/${notification.post.author?.username?.localName || notification.post.author?.address}/${notification.post.slug || notification.post.id}`;
      }
      return "/notifications";
    case "PostActionExecutedNotification":
      if (notification.post) {
        return `/p/${notification.post.author?.username?.localName || notification.post.author?.address}/${notification.post.slug || notification.post.id}`;
      }
      return "/notifications";
    case "TokenDistributedNotification":
      return "/notifications"; // No specific link for token distributions
    default:
      return "/notifications";
  }
};

const getNotificationActors = (notification: any): any[] => {
  switch (notification.__typename) {
    case "FollowNotification":
      return notification.followers?.map((f: any) => f.account) || [];
    case "MentionNotification":
      return notification.post?.author ? [notification.post.author] : [];
    case "CommentNotification":
      return notification.comment?.author ? [notification.comment.author] : [];
    case "QuoteNotification":
      return notification.quote?.author ? [notification.quote.author] : [];
    case "RepostNotification":
      return notification.reposts?.map((r: any) => r.account) || [];
    case "ReactionNotification":
      return notification.reactions?.map((r: any) => r.account) || [];
    case "PostActionExecutedNotification":
    case "AccountActionExecutedNotification":
      return notification.actions?.map((a: any) => a.executedBy || a.account) || [];
    case "TokenDistributedNotification":
      return []; // Token distributions don't have actors in the same way
    default:
      return [];
  }
};

const getPostTitleOrContent = (notification: any): { text: string | null; isContent: boolean } => {
  let title: string | null = null;
  let content: string | null = null;
  
  switch (notification.__typename) {
    case "MentionNotification":
    case "ReactionNotification":
      title = notification.post?.metadata?.title || null;
      content = notification.post?.metadata?.content || null;
      break;
    case "CommentNotification":
      // For comments, show the comment content if no title
      title = notification.comment?.metadata?.title || null;
      content = notification.comment?.metadata?.content || null;
      break;
    case "QuoteNotification":
      // For quotes, show the quote content if no title
      title = notification.quote?.metadata?.title || null;
      content = notification.quote?.metadata?.content || null;
      break;
    case "RepostNotification":
      // For reposts, show the reposted post title or content
      title = notification.post?.metadata?.title || null;
      content = notification.post?.metadata?.content || null;
      break;
    default:
      break;
  }
  
  return {
    text: title || content,
    isContent: !title && !!content
  };
};

const getCreatedAt = (notification: any): Date => {
  switch (notification.__typename) {
    case "FollowNotification":
      return new Date(notification.followers?.[0]?.followedAt || Date.now());
    case "CommentNotification":
      return new Date(notification.comment?.timestamp || Date.now());
    case "MentionNotification":
    case "RepostNotification":
    case "ReactionNotification":
      return new Date(notification.post?.timestamp || Date.now());
    case "QuoteNotification":
      return new Date(notification.quote?.timestamp || Date.now());
    case "PostActionExecutedNotification":
    case "AccountActionExecutedNotification":
      return new Date(notification.actions?.[0]?.executedAt || Date.now());
    case "TokenDistributedNotification":
      return new Date(notification.timestamp || Date.now());
    default:
      return new Date();
  }
};

export function NotificationView({ notification, onRead }: NotificationViewProps) {
  const Icon = getNotificationIcon(notification.__typename, notification);
  const message = getNotificationMessage(notification);
  const link = getNotificationLink(notification);
  const actors = getNotificationActors(notification);
  const postInfo = getPostTitleOrContent(notification);
  const createdAt = getCreatedAt(notification);
  const amount = getNotificationAmount(notification);

  const handleClick = () => {
    if (onRead) {
      onRead();
    }
  };

  return (
    <Link href={link} onClick={handleClick}>
      <div className={cn("flex items-start gap-3 p-4 hover:bg-accent/50 transition-colors cursor-pointer rounded-lg mx-2 my-1")}>
        <div className="flex-shrink-0 mt-0.5">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap">
            {actors.slice(0, 3).map((actor, index) => (
              <span key={actor?.address || index} className="flex items-center">
                <UserAvatar account={actor} className="h-5 w-5 mr-1" />
                <UserName account={actor} className="font-medium text-sm" />
                {index < actors.length - 1 && index < 2 && <span className="text-muted-foreground mr-1">,</span>}
                {index < actors.length - 1 && index < 2 && <span className="mr-1"></span>}
              </span>
            ))}
            {actors.length > 3 && <span className="text-sm text-muted-foreground ml-1 mr-1">and {actors.length - 3} others</span>}
            <span className="text-sm text-muted-foreground ml-1">{message}</span>
          </div>
          {amount && (
            <div className="mt-1 text-sm font-semibold text-green-600">
              {amount}
            </div>
          )}
          {postInfo.text && (
            <div className="mt-1">
              {postInfo.isContent ? (
                <TruncatedText text={postInfo.text} maxLength={100} />
              ) : (
                <div className="text-sm font-medium">"{postInfo.text}"</div>
              )}
            </div>
          )}
          <div className="mt-1 text-xs text-muted-foreground">
            {formatDistanceToNow(createdAt, { addSuffix: true })}
          </div>
        </div>
      </div>
    </Link>
  );
}

