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
import { Skeleton } from "@/components/ui/skeleton";
import {
	SessionType,
	useRefreshToken,
	useSession,
} from "@lens-protocol/react-web";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { Input } from "../ui/input";
import { DraftsList } from "./DraftsList";

export const WriteMenu = () => {
	const { data: session, loading, error } = useSession();
	const refreshToken = useRefreshToken();
	const [isOpen, setIsOpen] = useState(false);
	const [title, setTitle] = useState("");
	const router = useRouter();

	if (loading || error) {
		return null;
	}

	if (session?.type !== SessionType.WithProfile) {
		return null;
	}

	const handleCreate = async () => {
		const response = await fetch("/api/drafts", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${refreshToken}`,
			},
			body: JSON.stringify({ title }),
		});

		const data = await response.json();

		if (!data.draft) {
			return;
		}

		router.push(`/write/${data.draft.id}`);
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button>Write</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Write an Article</DialogTitle>
				</DialogHeader>
				<div className="space-y-4">
					<Dialog>
						<DialogTrigger asChild>
							<Button variant="ghost" className="w-full justify-start">
								<PlusIcon className="h-5 w-5 flex gap-2 text-md" />
								New Article
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogTitle>Create a New Article</DialogTitle>
							<Input
								placeholder="Title"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
							/>
							<DialogFooter>
								<Button onClick={handleCreate}>Create</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
					<div className="border-t pt-4">
						<h3 className="mb-2 font-semibold">Continue writing</h3>
						<Suspense fallback={<Skeleton className="w-full h-24" />}>
							<DraftsList onClick={(_id) => setIsOpen(false)} />
						</Suspense>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};
