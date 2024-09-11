"use client";

interface ContentNode {
	type: string;
	content?: Array<{ text?: string }>;
}

import { useStorage } from "@/lib/useStorage";
import type { ProfileId } from "@lens-protocol/react-web";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { DraftDeleteDialog } from "../navigation/draft-delete-dialog";
import { DraftOptionsDropdown } from "../navigation/draft-options";
import { Card, CardHeader, CardTitle } from "../ui/card";
import { UserAuthorView } from "../user/user-author-view";

interface DraftViewProps {
	draft: { id: string; content_json?: string };
	authorId?: ProfileId;
	isCloud: boolean;
}

// biome-ignore lint/suspicious/noExplicitAny: intended use
const extractTitle = (content: any): string => {
	try {
		const firstTextNode = content.content.find(
			(node: ContentNode) =>
				node.type === "heading" ||
				node.type === "paragraph" ||
				node.type === "text" ||
				node.content?.[0]?.text,
		);

		if (firstTextNode) {
			if (
				firstTextNode.type === "heading" ||
				firstTextNode.type === "paragraph"
			) {
				return firstTextNode.content[0].text;
			}

			const sentence = firstTextNode.content[0].text.split(".")[0];
			return sentence.length > 0 ? `${sentence}.` : "Untitled Draft";
		}

		return "Untitled Draft";
	} catch (error) {
		console.error("Error parsing content:", error);
		return "Untitled Draft";
	}
};

export const DraftView = ({ draft, authorId, isCloud }: DraftViewProps) => {
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const { saveDocument, documents: localDrafts } = useStorage();
	const queryClient = useQueryClient();

	const content = draft.content_json || "";
	const title = extractTitle(content);
	const authorIds = authorId ? [authorId] : [];

	const handleDelete = async () => {
		if (isCloud) {
			try {
				const res = await fetch(`/api/drafts?id=${draft.id}`, {
					method: "DELETE",
				});

				if (res.ok) {
					toast.success("Draft deleted successfully");
					queryClient.invalidateQueries({
						queryKey: ["drafts"],
						refetchType: "active",
					});
				} else {
					toast.error("Failed to delete draft");
				}
			} catch (err) {
				toast.error("Error deleting draft");
			}
		} else {
			const updatedDocuments = { ...useStorage.getState().documents };
			delete updatedDocuments[draft.id];
			saveDocument(draft.id, updatedDocuments);
			toast.success("Draft deleted successfully");
		}
		setIsDeleteDialogOpen(false);
	};

	return (
		<div className="relative">
			<Link href={`/write/${draft.id}`}>
				<Card className="bg-transparent hover:bg-card/50 hover:text-card-foreground transition-all ease-in duration-100 group border-0 shadow-none">
					<CardHeader>
						{authorId && <UserAuthorView profileIds={authorIds} />}
						<CardTitle className="text-3xl flex items-center gap-2">
							{title}
						</CardTitle>
					</CardHeader>
				</Card>
				<div className="absolute top-2 right-2">
					<DraftOptionsDropdown
						onDeleteClick={() => setIsDeleteDialogOpen(true)}
					/>
				</div>
				<DraftDeleteDialog
					isOpen={isDeleteDialogOpen}
					onClose={() => setIsDeleteDialogOpen(false)}
					onConfirm={handleDelete}
				/>
			</Link>
		</div>
	);
};
