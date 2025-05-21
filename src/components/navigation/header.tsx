"use client";

import { type ConnectionStatus, useYjsState } from "@/hooks/use-yjs-state";
import { MeResult } from "@lens-protocol/client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { DraftCreateButton } from "../draft/draft-create-button";
import { EditorOptionsDropdown } from "../editor/addons/editor-options-dropdown";
import { FountainLogo } from "../icons/custom-icons";
import { FeedbackForm } from "../misc/feedback-form";
import { SettingsBadge } from "../settings/settings-badge";
import { ConnectionBadge } from "../ui/connection-badge";
import { UserMenu } from "../user/user-menu";
import { PublishMenu } from "../publish/publish-dialog";
import { getBlogData, BlogData } from "@/lib/settings/get-blog-data";
import { toast } from "sonner";
import { BlogEmailSubscribe } from "../newsletter/newsletter-subscribe-dialog";
import { useIsMobile } from "@/hooks/use-mobile";

export const Header = ({ session }: { session: MeResult | null }) => {
  const pathname = usePathname();
  const [blogData, setBlogData] = useState<BlogData | null>(null);
  const isWritePage = pathname.startsWith("/w");
  const isSettingsPage = pathname.startsWith("/settings");
  const isBlogPage = pathname.startsWith("/b/");
  const isPostPage = pathname.startsWith("/p/");
  const pathSegments = pathname.split("/").filter(Boolean);
  const blogId = isBlogPage && pathSegments.length >= 2 ? pathSegments[1] : undefined;
  const blogSlug = isBlogPage && pathSegments.length >= 3 ? pathSegments[2] : undefined;
  const postId = isPostPage && pathSegments.length >= 3 ? pathSegments[2] : undefined;
  const documentId = pathname.split("/").filter(Boolean).pop() ?? "";
  const yjsState = useYjsState((state) => state.getState(documentId) ?? { status: "disconnected" as ConnectionStatus });
  const isAuthenticated = session !== null;
  const logoLink = isAuthenticated ? "/featured" : "/";
  const isMobile = useIsMobile()

  useEffect(() => {
    const fetchBlogData = async () => {
      if (blogId) {
        try {
          const data = await getBlogData(blogId, isBlogPage ? blogSlug : undefined);
          setBlogData(data);
        } catch (error) {
          console.error("Error fetching blog data:", error);
          toast.error("Failed to load blog information");
        }
      }
    };

    if ((isBlogPage && blogId) || (isPostPage && postId)) {
      fetchBlogData();
    } else {
      setBlogData(null);
    }
  }, [isBlogPage, blogId, blogSlug]);


  const HeaderContent = () => (
    <div className="flex items-center justify-between h-full px-2">
      <div className="flex gap-4 items-center justify-center">
        <Link prefetch href={logoLink} className="w-10 h-10 flex items-center justify-center pointer-events-auto">
          <FountainLogo />
        </Link>
        {isWritePage && <ConnectionBadge {...yjsState} />}
        {isSettingsPage && <SettingsBadge />}
      </div>
      <div className="flex gap-4 pointer-events-auto">
        {isAuthenticated && <FeedbackForm />}
        {isBlogPage && blogData && <BlogEmailSubscribe blogData={blogData} variant="default" />}
        {isWritePage && <PublishMenu documentId={documentId} />}
        {isWritePage && <EditorOptionsDropdown />}
        {!isWritePage && !isMobile && <DraftCreateButton />}
        <UserMenu session={session} showDropdown={true} />
      </div>
    </div>
  );

  if (isWritePage) {
    return (
      <div className="sticky top-0 w-full h-[58px] z-[40] bg-background/70 backdrop-blur-xl border-b border-border">
        <HeaderContent />
      </div>
    );
  }

  return (
    <div className="sticky top-0 w-full h-[58px] z-[40] bg-background/70 backdrop-blur-xl border-b border-border">
      <HeaderContent />
    </div>
  );
};
