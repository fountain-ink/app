import Link from "next/link";
import { FountainLogo } from "./Icons";
import { ThemeSidebar } from "./ThemeEditor";
import { Button } from "./ui/button";
import { UserMenu } from "./user/UserMenu";

export const Header = () => {
	return (
		<div className="fixed w-full p-2 z-[300] flex justify-between items-center">
			<Link href={"/"} className="w-10 h-10 flex items-center justify-center">
				<FountainLogo />
			</Link>
			<div className="flex gap-4">
				<ThemeSidebar />
				<Link href={"/write"} className="h-10 flex items-center justify-center">
					<Button className="rounded-full px-6 font-bold">Write</Button>
				</Link>
				<UserMenu />
			</div>
		</div>
	);
};
