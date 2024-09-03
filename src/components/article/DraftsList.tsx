"use client";

import { Button } from "@/components/ui/button";
import { SessionType, useSession } from "@lens-protocol/react-web";
import { useQuery } from "@tanstack/react-query";
import { FileIcon, MoreVertical, TrashIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { LoadingSpinner } from "../LoadingSpinner";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const fetchDrafts = async ({ queryKey }: { queryKey: [string] }) => {
	const response = await fetch("/api/drafts", {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	})
		.then((res) => res.json())
		.catch((err) => toast.error(err));

	const { drafts } = response;

	return drafts;
};

export const DraftsList = ({ onClick }: { onClick?: (id: string) => void }) => {
	const {
		data: drafts,
		isLoading: queryLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: ["drafts"],
		queryFn: fetchDrafts,
	});

	const {
		data: session,
		loading: sessionLoading,
		error: sessionError,
	} = useSession();

	const [draftToDelete, setDraftToDelete] = useState<{
		id: string;
		title: string;
	} | null>(null);

	if (queryLoading || sessionLoading) return <LoadingSpinner />;
	if (session?.type !== SessionType.WithProfile) return null;
	if (error) return <div>Error loading drafts: {error.message}</div>;
	if (!drafts || drafts.length === 0) return <div>No drafts available</div>;

	const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();

		if (!draftToDelete) return;

		try {
			const res = await fetch(`/api/drafts?id=${draftToDelete.id}`, {
				method: "DELETE",
			});

			if (res.ok) {
				toast.success("Draft deleted successfully");
				refetch();
			} else {
				toast.error("Failed to delete draft");
			}
		} catch (err) {
			toast.error("Error deleting draft");
		}

		setDraftToDelete(null);
	};

	return (
		<div className="space-y-2">
			{drafts.map((draft: { id: string; title: string }) => (
				<div key={draft.id} className="flex justify-between items-center">
					<Link href={`/write/${draft.id}`} className="text-md w-full">
						<Button
							onClick={() => onClick?.(draft.id)}
							variant="ghost"
							className="w-full flex gap-2 justify-between p-2"
						>
							<div className="flex gap-2">
								<FileIcon className="h-5 w-5" />
								{draft.title || "Untitled Draft"}
							</div>
							<div>
								<Dialog>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												onClick={(e) => e.stopPropagation()}
												variant="ghost"
												className="hover:bg-accent hover:text-muted-foreground stroke-1 hover:stroke-2"
												size="icon"
											>
												<MoreVertical className="h-5 w-5" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent className="rounded-xl text-base">
											<DialogTrigger
												onClick={(e) => e.stopPropagation()}
												asChild
											>
												<DropdownMenuItem
													onClick={() => setDraftToDelete(draft)}
													className="flex gap-2 items-center"
												>
													<TrashIcon className="h-5 w-5" />
													Delete draft
												</DropdownMenuItem>
											</DialogTrigger>
										</DropdownMenuContent>
									</DropdownMenu>
									<DialogContent>
										<DialogHeader>
											<DialogTitle>
												Are you sure you want to delete this draft?
											</DialogTitle>
											<DialogDescription>
												This action cannot be undone.
											</DialogDescription>
										</DialogHeader>
										<DialogFooter>
											<DialogClose asChild>
												<Button
													onClick={(e) => e.stopPropagation()}
													variant="secondary"
												>
													Cancel
												</Button>
											</DialogClose>
											<Button variant="destructive" onClick={handleDelete}>
												Delete
											</Button>
										</DialogFooter>
									</DialogContent>
								</Dialog>
							</div>
						</Button>
					</Link>
				</div>
			))}
		</div>
	);
};
