"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	SessionType,
	useRefreshToken,
	useSession,
} from "@lens-protocol/react-web";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { useAccount } from "wagmi";
import { LoadingSpinner } from "./LoadingSpinner";
import { UserDrafts } from "./user/UserDrafts";

export const WriteMenu = ({text = "Write"}: {text?: string}) => {
	const { data: session, loading, error } = useSession();
	const refreshToken = useRefreshToken();
	const [isOpen, setIsOpen] = useState(false);
	const [title, setTitle] = useState("");
	const { isConnected: isWalletConnected } = useAccount();
	const router = useRouter();

	if (loading || error) {
		return null;
	}

	if (session?.type !== SessionType.WithProfile || !isWalletConnected) {
		return (
			<Link href="/write/new">
				<Button>{text}</Button>
			</Link>
		);
	}

	const handleCreate = async () => {
		const response = await fetch("/api/drafts", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({}),
		});

		const { draft } = await response.json();

		if (!draft) {
			return;
		}

		setIsOpen(false);

		router.refresh();
		router.replace(`/write/${draft.id}`);
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
        <Button>{text}</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Write an Article</DialogTitle>
				</DialogHeader>
				<div className="space-y-4">
					<Button
						onClick={handleCreate}
						variant="ghost"
						className="w-full justify-start flex gap-2 p-2"
					>
						<PlusIcon className="h-5 w-5 flex gap-2 text-md" />
						New Article
					</Button>
					<div className="border-t pt-4">
						<h3 className="mb-2 font-semibold">Continue writing</h3>
						<Suspense fallback={<LoadingSpinner />}>
							<UserDrafts onClick={() => setIsOpen(false)} />
						</Suspense>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};
