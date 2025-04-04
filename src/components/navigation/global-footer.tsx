"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FountainLogo, HeyIcon } from "../icons/custom-icons";
import { TbBrandX, TbX } from "react-icons/tb";

export const GlobalFooter = () => {
  const pathname = usePathname();

  if (pathname.includes("/write") || pathname.includes("/publish")) {
    return null;
  }

  return (
    <footer className="border-t text-xs border-border mt-auto py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-center space-x-4 sm:space-x-8 text-muted-foreground">
          {/* <div className="flex items-center gap-2 opacity-40 w-4 h-4 -mt-1">
            <FountainLogo />
          </div> */}
          <span className="text-muted-foreground">© 2025 Fountain Labs</span>
          {/* <Link href="/about" className="hover:text-primary transition-colors">
            About
          </Link> */}
          <Link href="/policy" className="hover:text-primary transition-colors">
            Policy
          </Link>
          <Link href="/tos" className="hover:text-primary transition-colors">
            Terms
          </Link>
          <Link href="mailto:info@fountain.ink" className="hover:text-primary transition-colors">
            Contact
          </Link>
          <Link href="https://github.com/fountain-ink" className="hover:text-primary transition-colors">
            GitHub
          </Link>
          <Link href="https://twitter.com/fountaindotink" className="hover:text-primary transition-colors">
            <TbBrandX className="w-5 h-5" />
          </Link>
          <Link href="https://hey.xyz/u/fountain" className="hover:text-primary transition-colors">
            <HeyIcon />
          </Link>
        </div>
      </div>
    </footer>
  );
};
