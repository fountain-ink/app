import { useProfileId } from "@/hooks/use-profile-id";
import type { Post } from "@lens-protocol/react-web";
import { Bookmark, Link, MoreHorizontal, Trash2 } from "lucide-react";
import { ActionButton, type DropdownItem } from "./post-action-button";

export const PostMenu = ({ post }: { post: Post }) => {
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  const profileId = useProfileId();
  const isUserPost = post.by?.id === profileId;

  const handleDelete = () => {
    // Implement delete functionality
    console.log("Delete post:", post.id);
  };

  const dropdownItems: DropdownItem[] = [
    {
      icon: Link,
      label: "Copy link",
      onClick: handleCopyLink,
    },
    ...(isUserPost
      ? [
          {
            icon: Trash2,
            label: "Delete post",
            onClick: handleDelete,
          },
        ]
      : []),
  ];

  return (
    <div className="flex flex-row gap-3 items-center justify-center">
      <ActionButton
        icon={Bookmark}
        label="Bookmark"
        strokeColor="hsl(var(--primary))"
        fillColor="hsl(var(--primary) / 0.8)"
      />
      <ActionButton
        icon={MoreHorizontal}
        label="More"
        strokeColor="hsl(var(--muted-foreground))"
        fillColor="hsl(var(--muted-foreground))"
        dropdownItems={dropdownItems}
        showChevron={false}
      />
    </div>
  );
};
