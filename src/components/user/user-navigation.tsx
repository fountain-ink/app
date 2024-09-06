"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";

export const UserNavigation = ({
	username,
	isUserProfile,
}: { username: string; isUserProfile: boolean }) => {
	const pathname = usePathname();

	return (
		<div className="flex flex-row gap-4">
			<Link href={`/u/${username}`}>
				<Button
					variant={pathname === `/u/${username}` ? "secondary" : "ghost"}
					className="text-lg"
				>
					Published
				</Button>
			</Link>

			<Link href={`/u/${username}/all`}>
				<Button
					variant={pathname === `/u/${username}/all` ? "secondary" : "ghost"}
					className="text-lg"
				>
					All
				</Button>
			</Link>

			{isUserProfile && (
				<Link href={`/u/${username}/drafts`}>
					<Button
						variant={pathname === `/u/${username}/drafts` ? "secondary" : "ghost"}
						className="text-lg"
					>
						Drafts
					</Button>
				</Link>
			)}
		</div>
	);
};
