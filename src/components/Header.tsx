import { FountainLogo } from "./Icons";
import Link from "next/link";
import { UserMenu } from "./user/UserMenu";

export const Header = () => {

	return (
		<div className="fixed w-full p-2 z-[50] backdrop-blur-sm flex justify-between items-center">
			<Link href={"/"} className="w-10 h-10 flex items-center justify-center">
				<FountainLogo />
			</Link>
			<UserMenu />
		</div>
	);
};
