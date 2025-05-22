"use client";

import { useState, useEffect } from "react";
import { Post } from "@lens-protocol/client";
import { EvmAddress } from "@lens-protocol/metadata";
import { PostView } from "../post/post-view";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { AlertTriangle, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Database } from "@/lib/db/database";
import { toast } from "sonner";
import { useAuthenticatedUser } from "@lens-protocol/react";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { formatDate } from "@/lib/utils";

interface CuratedPostViewProps {
  post: Post;
  authors: EvmAddress[];
  isCurated?: boolean;
  isAuthorBanned?: boolean;
  banReason?: string | null;
  onCurationChange?: (post: Post, isCurated: boolean) => void;
  onBanChange?: (post: Post, isBanned: boolean, reason?: string) => void;
}

export const CuratedPostView = ({
  post,
  authors,
  isCurated = false,
  isAuthorBanned = false,
  banReason = null,
  onCurationChange,
  onBanChange,
}: CuratedPostViewProps) => {
  const [curated, setCurated] = useState(isCurated);
  const [banned, setBanned] = useState(isAuthorBanned);
  const [reason, setReason] = useState<string | null>(banReason);
  const [isLoading, setIsLoading] = useState(false);
  const [banInfo, setBanInfo] = useState<{ addedBy?: string; timestamp?: string } | null>(null);
  const [curationInfo, setCurationInfo] = useState<{ addedBy?: string; timestamp?: string } | null>(null);
  const { data: user } = useAuthenticatedUser();

  useEffect(() => {
    setCurated(isCurated);
    setBanned(isAuthorBanned);
    setReason(banReason);

    // Fetch ban details if author is banned
    if (isAuthorBanned) {
      fetchBanDetails();
    }

    // Fetch curation details if post is curated
    if (isCurated) {
      fetchCurationDetails();
    }
  }, [isCurated, isAuthorBanned, banReason]);

  // Handle auto-ban when reason changes
  const handleReasonChange = (value: string) => {
    setReason(value);
    if (value && !banned) {
      handleBanToggle(value);
    }
  };

  const fetchBanDetails = async () => {
    try {
      const response = await fetch(`/api/admin/ban?address=${post.author.address}`);

      if (response.ok) {
        const result = await response.json();
        if (result.data && result.data.length > 0) {
          const banRecord = result.data[0];
          setBanInfo({
            addedBy: banRecord.added_by,
            timestamp: banRecord.created_at,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching ban details:", error);
    }
  };

  const fetchCurationDetails = async () => {
    try {
      const response = await fetch(`/api/admin/curate?slug=${post.slug}`);

      if (response.ok) {
        const result = await response.json();
        if (result.data && result.data.length > 0) {
          const curationRecord = result.data[0];
          setCurationInfo({
            addedBy: curationRecord.added_by,
            timestamp: curationRecord.created_at,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching curation details:", error);
    }
  };

  const handleCurationToggle = async (checked: boolean) => {
    setIsLoading(true);
    try {
      if (checked) {
        // Add to curated
        const response = await fetch("/api/admin/curate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            slug: post.slug,
            added_by: user?.address,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to add to featured list");
        }

        setCurated(true);
        onCurationChange?.(post, true);
        toast.success("Post added to featured list");

        // Update curation info
        setCurationInfo({
          addedBy: user?.address,
          timestamp: new Date().toISOString(),
        });
      } else {
        // Remove from curated
        const response = await fetch(`/api/admin/curate?slug=${post.slug}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to remove from featured list");
        }

        setCurated(false);
        setCurationInfo(null);
        onCurationChange?.(post, false);
        toast.success("Post removed from featured list");
      }
    } catch (error) {
      console.error("Error toggling curation:", error);
      toast.error("Failed to update featured status");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBanToggle = async (selectedReason?: string) => {
    setIsLoading(true);
    try {
      if (banned) {
        // Remove ban
        const response = await fetch(`/api/admin/ban?address=${post.author.address}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to unban author");
        }

        setBanned(false);
        setReason(null);
        setBanInfo(null);
        onBanChange?.(post, false);
        toast.success("Author unbanned");
      } else if (selectedReason || (reason && reason !== null)) {
        // Add ban with reason (use passed reason or state reason)
        const banReason = selectedReason || (reason as string);
        const response = await fetch("/api/admin/ban", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            address: post.author.address,
            reason: banReason,
            added_by: user?.address,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to ban author");
        }

        setBanned(true);
        onBanChange?.(post, true, banReason);
        toast.success(`Author banned for ${banReason}`);

        // Update ban info
        setBanInfo({
          addedBy: user?.address,
          timestamp: new Date().toISOString(),
        });
      } else {
        toast.error("Please select a reason for banning");
      }
    } catch (error) {
      console.error("Error toggling ban:", error);
      toast.error("Failed to update ban status");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 border border-border rounded-md p-4">
      {/* Featured Toggle - Moved Above Post */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Switch id="featured-toggle" checked={curated} onCheckedChange={handleCurationToggle} disabled={isLoading} />
          <Label htmlFor="featured-toggle" className="flex items-center gap-2 font-medium cursor-pointer">
            <Sparkles className={`h-4 w-4 ${curated ? "text-yellow-500" : "text-muted-foreground"}`} />
            <span>Featured</span>

            {curated && curationInfo && (
              <span className="text-xs text-muted-foreground ml-2">
                by {curationInfo.addedBy?.slice(0, 6)}...{curationInfo.addedBy?.slice(-4)} on{" "}
                {curationInfo.timestamp ? formatDate(curationInfo.timestamp) : "unknown date"}
              </span>
            )}
          </Label>
        </div>

        <div className="flex items-center gap-2">
          {curated && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Featured
            </Badge>
          )}

          {banned && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Banned
            </Badge>
          )}
        </div>
      </div>

      <PostView
        post={post}
        authors={authors}
        options={{
          showContent: false,
          showAuthor: true,
          showTitle: true,
          showSubtitle: true,
          showBlog: true,
          showDate: true,
          showPreview: true,
        }}
      />

      <div className="flex flex-col gap-4 border-t border-border pt-4">
        {/* Ban controls and information */}
        {banned ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Author Status:</span>
              <span className="text-sm text-destructive font-medium">Banned ({reason})</span>

              {banInfo && (
                <span className="text-xs text-muted-foreground">
                  by {banInfo.addedBy?.slice(0, 6)}...{banInfo.addedBy?.slice(-4)} on{" "}
                  {banInfo.timestamp ? formatDate(banInfo.timestamp) : "unknown date"}
                </span>
              )}
            </div>

            <Button variant="outline" onClick={() => handleBanToggle()} disabled={isLoading}>
              Unban Author
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium flex items-center gap-1">Author Status: Active</span>
            </div>

            <div className="flex items-center gap-2">
              <Select value={reason || ""} onValueChange={handleReasonChange} disabled={banned || isLoading}>
                <SelectTrigger className="h-8 w-36">
                  <SelectValue placeholder="Ban reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bot">Bot</SelectItem>
                  <SelectItem value="spam">Spam</SelectItem>
                  <SelectItem value="forbidden">Forbidden</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
