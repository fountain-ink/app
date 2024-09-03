"use client";

import { isDevEnvironment, isProdEnvironment } from "@/lib/envCheck";
import { getBaseUrl } from "@/lib/getBaseUrl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { WriteMenu } from "./article/WriteMenu";
import { FountainLogo } from "./Icons";
import { ThemeSidebar } from "./ThemeEditor";
import { UserMenu } from "./user/UserMenu";

export const Header = () => {
	const pathname = usePathname();

	console.log(
		process.env.NODE_ENV,
		isProdEnvironment,
		isDevEnvironment,
		getBaseUrl(),
		pathname,
	);
	// FIXME: Temporary before release
	if (!isDevEnvironment) {
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
