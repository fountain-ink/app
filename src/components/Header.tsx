"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FountainLogo } from "./Icons";
import { ThemeSidebar } from "./ThemeEditor";
import { UserMenu } from "./user/UserMenu";
import { WriteMenu } from "./WriteMenu";

export const Header = () => {
	const pathname = usePathname();

	// FIXME: Temporary before release
	if (pathname === "/") {
		return null;
	}

	return (
		<div className="fixed w-full p-2 z-[300] flex justify-between items-center">
			<Link href={"/"} className="w-10 h-10 flex items-center justify-center">
				<FountainLogo />
			</Link>
			<div className="flex gap-4">
				<ThemeSidebar />
				<WriteMenu />
				<UserMenu />
			</div>
		</div>
	);
};
