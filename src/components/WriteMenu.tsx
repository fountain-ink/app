"use client";

import {
	SessionType,
	useRefreshToken,
	useSession,
} from "@lens-protocol/react-web";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./ui/dialog";

export const WriteMenu = () => {
	const { data: session, loading, error } = useSession();
	const refreshToken = useRefreshToken();

	// const drafts = await fetch("/api/draft", {
	// 	method: "GET",
	// 	headers: {
	// 		Authorization: `Bearer ${refreshToken}`,
	// 		"Content-Type": "application/json",
	// 	},
	// });


	if (loading || error) {
		return null;
	}

	if (session?.type !== SessionType.WithProfile) {
		return null;
	}

	return (
		<Dialog defaultOpen>
			<DialogTrigger>
				<Button>Write</Button>
			</DialogTrigger>
			<DialogContent className="max-w-72">
				<DialogHeader>
					<DialogTitle>Write an Article</DialogTitle>
				</DialogHeader>

				<Button variant="ghost" className="flex gap-2 text-md">
					<Link href={"/write"}>
						<PlusIcon />
						New Article
					</Link>
				</Button>
			</DialogContent>
		</Dialog>
	);
};
