"use client";

import { useScroll } from "@/hooks/use-scroll";
import { motion, useSpring } from "framer-motion";
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

  const springConfig = {
    stiffness: 300,
    damping: 20,
  };

  const y = useSpring(0, springConfig);

  if (!isVisible) {
    y.set(-100);
  } else {
    y.set(0);
  }

  // FIXME: Temporary before release
  if (!hostname.includes("dev") && !hostname.includes("localhost")) {
    return (
      <motion.div
        style={{ y }}
        className="fixed top-0 w-full h-[100px] -mt-[42px] pt-[50px] z-[40] bg-background/20 backdrop-blur-md border-b border-border overflow-hidden p-2"
      >
        <div className="flex items-end justify-between absolute bg-gradient-to-t from-transparent to-background bottom-0 left-0 right-0 h-[80px] pb-2 px-2">
          <Link href={"/"} className="w-10 h-10 flex items-center justify-center pointer-events-auto">
            <FountainLogo />
          </Link>
        </div>
      </motion.div>
    );
  }

  const isWritePage = pathname.startsWith("/write");

  return (
    <motion.div
      style={{ y }}
      className="fixed top-0 w-full h-[100px] -mt-[42px] pt-[50px] z-[40] bg-background/20 backdrop-blur-md border-b border-border overflow-hidden p-2"
    >
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
    </motion.div>
  );
};
