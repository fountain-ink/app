"use client";

import { useScroll } from "@/hooks/use-scroll";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FountainLogo } from "../custom-icons";
import { ThemeSidebar } from "../theme/theme-editor";
import { UserMenu } from "../user/user-menu";
import { PublishMenu } from "./publish-menu";
import { WriteMenu } from "./write-menu";

export const Header = () => {
  const pathname = usePathname();
  const isVisible = useScroll();
  const hostname = typeof window !== "undefined" && window.location.hostname ? window.location.hostname : "";

  // FIXME: Temporary before release
  if (!hostname.includes("dev") && !hostname.includes("localhost")) {
    return (
      <div
        className={`fixed top-0 w-full p-2 z-[40] flex justify-between items-center pointer-events-none transition-opacity duration-500 ${
          isVisible ? "opacity-100" : "opacity-0"
        } hover:opacity-100`}
      >
        <Link href={"/"} className="w-10 h-10 flex items-center justify-center pointer-events-auto">
          <FountainLogo />
        </Link>
      </div>
    );
  }

  const isWritePage = pathname.startsWith("/write");

  return (
    <div
      className={`fixed top-0 w-full p-2 z-[40] flex justify-between items-center backdrop-blur-lg border-b border-border transition-opacity duration-500 ${
        isVisible ? "opacity-100" : "opacity-0"
      } hover:opacity-100`}
    >
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
};
