"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FountainLogo } from "../custom-icons";
import { ThemeSidebar } from "../theme/theme-editor";
import { UserMenu } from "../user/user-menu";
import { PublishMenu } from "./publish-menu";
import { WriteMenu } from "./write-menu";

export const Header = () => {
  const pathname = usePathname();
  const hostname = typeof window !== "undefined" && window.location.hostname ? window.location.hostname : "";
  const isWritePage = pathname.startsWith("/write");

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
      <Link href={"/"} className="w-10 h-10 flex items-center justify-center pointer-events-auto">
        <FountainLogo />
      </Link>
      <div className="flex gap-4 pointer-events-auto">
        {isWritePage && <ThemeSidebar />}
        {isWritePage && <PublishMenu />}
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
