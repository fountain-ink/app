"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { FileEditIcon, TrashIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
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
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: ["drafts"],
		queryFn: fetchDrafts,
	});

	const [draftToDelete, setDraftToDelete] = useState<{
		id: string;
		title: string;
	} | null>(null);

	if (isLoading) return <Skeleton className="w-full h-24" />;
	if (error) return <div>Error loading drafts: {error.message}</div>;
	if (!drafts || drafts.length === 0) return <div>No drafts available</div>;

	const handleDelete = async () => {
		if (!draftToDelete) return;

		try {
			const res = await fetch(`/api/drafts?id=${draftToDelete.id}`, {
				method: "DELETE",
			});

			if (res.ok) {
				toast.success("Draft deleted successfully");
				refetch(); // Refetch drafts after successful deletion
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
					<Link
						href={`/write/${draft.id}`}
						className="flex gap-2 text-md w-full justify-start"
					>
						<Button
							onClick={() => onClick?.(draft.id)}
							variant="ghost"
							className="w-full justify-start"
						>
							<FileEditIcon className="h-5 w-5" />
							{draft.title || "Untitled Draft"}
						</Button>
					</Link>
					<Dialog>
						<DialogTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setDraftToDelete(draft)}
							>
								<TrashIcon className="h-5 w-5" />
							</Button>
						</DialogTrigger>
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
									<Button variant="secondary">Cancel</Button>
								</DialogClose>
								<Button variant="destructive" onClick={handleDelete}>
									Delete
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>
			))}
		</div>
	);
};
