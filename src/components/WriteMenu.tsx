"use client";

import { SessionType, useSession } from "@lens-protocol/react-web";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { LoginButton } from "./auth/LoginButton";
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

				<Link href={"/write"}>
					<Button variant="ghost" className="flex gap-2 text-md">
						<PlusIcon />
						New Article
					</Button>
				</Link>
			</DialogContent>
		</Dialog>
	);
};
