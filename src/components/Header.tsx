"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FountainLogo } from "./Icons";
import { ThemeSidebar } from "./ThemeEditor";
import { UserMenu } from "./user/UserMenu";
import { isDevEnvironment } from "@/lib/envCheck";
import { WriteMenu } from "./WriteMenu";

export const Header = () => {
	const pathname = usePathname();
	const hostname =
		typeof window !== "undefined" && window.location.hostname
			? window.location.hostname
			: "";
	
	// FIXME: Temporary before release
	if (!hostname.includes("dev") && !isDevEnvironment) {
		return (
			<div className="fixed w-full p-2 z-[40] flex justify-between items-center pointer-events-none">
				<Link
					href={"/"}
					className="w-10 h-10 flex items-center justify-center pointer-events-auto"
				>
					<FountainLogo />
				</Link>
			</div>
		);
	}

	return (
		<div className="fixed w-full p-2 z-[40] flex justify-between items-center pointer-events-none">
			<Link
				href={"/"}
				className="w-10 h-10 flex items-center justify-center pointer-events-auto"
			>
				<FountainLogo />
			</Link>
			<div className="flex gap-4 pointer-events-auto">
				{pathname.startsWith("/write") && <ThemeSidebar />}
				<WriteMenu />
				<UserMenu />
			</div>
		</div>
	);
};
