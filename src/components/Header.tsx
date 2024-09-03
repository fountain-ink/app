"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WriteMenu } from "./article/WriteMenu";
import { FountainLogo } from "./Icons";
import { ThemeSidebar } from "./ThemeEditor";
import { UserMenu } from "./user/UserMenu";
import { getBaseUrl } from "@/lib/getBaseUrl";
import { isProdEnvironment } from "@/lib/envCheck";

export const Header = () => {
	const pathname = usePathname();

	// FIXME: Temporary before release
	if (isProdEnvironment) {
		return (
			<div className="fixed w-full p-2 z-[300] flex justify-between items-center pointer-events-none">
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
		<div className="fixed w-full p-2 z-[300] flex justify-between items-center pointer-events-none">
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
