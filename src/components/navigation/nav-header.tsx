"use client";

import { type ConnectionStatus, useYjsState } from "@/hooks/use-yjs-state";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FeedbackForm } from "../misc/feedback-form";
import { ConnectionBadge } from "../ui/connection-badge";
import { UserMenu } from "../user/user-menu";
import { PublishMenu } from "./publish-menu-button";
import { WriteMenu } from "./write-menu-button";
import { EditorOptionsDropdown } from "../editor/addons/editor-options-dropdown";
import { FountainLogo } from "../icons/custom-icons";

export const Header = () => {
  const pathname = usePathname();
  const hostname = typeof window !== "undefined" && window.location.hostname ? window.location.hostname : "";
  const isWritePage = pathname.startsWith("/write");
  const documentId = pathname.split("/").filter(Boolean).pop() ?? "";
  const yjsState = useYjsState((state) => state.getState(documentId) ?? { status: "disconnected" as ConnectionStatus });

  // FIXME: Temporary before release
  if (!hostname.includes("dev") && !hostname.includes("localhost")) {
    return (
      <div className="fixed top-0 w-full h-[100px] -mt-[42px] pt-[50px] z-[40] bg-background/70 backdrop-blur-xl border-b border-border overflow-hidden p-2">
        <div className="flex items-end justify-between absolute bg-gradient-to-t from-transparent to-background bottom-0 left-0 right-0 h-[80px] pb-2 px-2">
          <Link href={"/"} className="w-10 h-10 flex items-center justify-center pointer-events-auto">
            <FountainLogo />
          </Link>
        </div>
      </div>
    );
  }

  const HeaderContent = () => (
    <div className="flex items-end justify-between absolute bg-gradient-to-t from-transparent to-background bottom-0 left-0 right-0 h-[80px] pb-2 px-2">
      <div className="flex gap-4 items-center justify-center">
        <Link href={"/"} className="w-10 h-10 flex items-center justify-center pointer-events-auto">
          <FountainLogo />
        </Link>
        {isWritePage && <ConnectionBadge {...yjsState} />}
      </div>
      <div className="flex gap-4 pointer-events-auto">
        <FeedbackForm />

        {isWritePage && <PublishMenu />}
        {isWritePage && <EditorOptionsDropdown />}
        {!isWritePage && <WriteMenu />}
        <UserMenu />
      </div>
    </div>
  );

  if (isWritePage) {
    return (
      <div className="fixed top-0 w-full h-[100px] -mt-[42px] pt-[50px] z-[40] bg-background/70 backdrop-blur-xl border-b border-border overflow-hidden">
        <HeaderContent />
      </div>
    );
  }

  return (
    <div className="fixed top-0 w-full h-[100px] -mt-[42px] pt-[50px] z-[40] bg-background/70 backdrop-blur-xl border-b border-border overflow-hidden">
      <HeaderContent />
    </div>
  );
};
