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
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";

export const PublishMenu = ({ text = "Publish" }: { text?: string }) => {
	const { data: session, loading, error } = useSession();
	const refreshToken = useRefreshToken();
	const [isOpen, setIsOpen] = useState(false);
	const [title, setTitle] = useState("");
	const { isConnected: isWalletConnected } = useAccount();
	const router = useRouter();

	if (loading || error) {
		return null;
	}

	const handlePublish = async () => {
		toast.error("Not implemented yet");

		// const response = await fetch("/api/drafts", {
		// 	method: "POST",
		// 	headers: {
		// 		"Content-Type": "application/json",
		// 	},
		// 	body: JSON.stringify({}),
		// });

		// const { draft } = await response.json();

		// if (!draft) {
		// 	return;
		// }

		// setIsOpen(false);

		// router.refresh();
		// router.replace(`/write/${draft.id}`);
	};

	if (session?.type !== SessionType.WithProfile || !isWalletConnected) {
		return (
			<Button onClick={() => toast.info("Login to publish")}>Publish</Button>
		);
	}

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button>{text}</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Publish an Article</DialogTitle>
				</DialogHeader>
				<div className="space-y-4">
					<Button
						onClick={handlePublish}
						variant="ghost"
						className="w-full justify-start flex gap-2 p-2"
					>
						Publish
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
};
