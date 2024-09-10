"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { getRandomUid } from "@/lib/getRandomUid";
import {
	SessionType,
	useRefreshToken,
	useSession,
} from "@lens-protocol/react-web";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { useAccount } from "wagmi";
import { LoadingSpinner } from "../loading-spinner";
import { DraftsList } from "./drafts-list";

export const WriteMenu = ({ text = "Write" }: { text?: string }) => {
	const { data: session, loading, error } = useSession();
	const refreshToken = useRefreshToken();
	const [isOpen, setIsOpen] = useState(false);
	const [title, setTitle] = useState("");
	const { isConnected: isWalletConnected } = useAccount();
	const router = useRouter();

	if (loading || error) {
		return null;
	}

	const handleNew = () => {
		const uid = getRandomUid();
		const id = `local-${uid}`;

		setIsOpen(false);
		router.refresh();
		router.replace(`/write/${id}`);
	};

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

	if (session?.type !== SessionType.WithProfile || !isWalletConnected) {
		return <Button onClick={() => handleNew()}>{text}</Button>;
	}

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button>{text}</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px] ">
				<DialogHeader>
					<DialogTitle>Write an article</DialogTitle>
				</DialogHeader>
				<Suspense
					fallback={
						<LoadingSpinner className="w-full h-full items-center jusify-center" />
					}
				>
					<div className=" h-96 overflow-y-scroll">
						<DraftsList />
					</div>
				</Suspense>

				<DialogFooter>
					<div className="flex justify-between items-center w-full">
						<Button variant="ghost">Cancel</Button>
						<Button onClick={handleCreate} className="flex gap-2">
							<PlusIcon className="h-5 w-5 flex gap-2 text-md" />
							New Article
						</Button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
