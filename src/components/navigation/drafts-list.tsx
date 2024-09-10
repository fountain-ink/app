"use client";

import { useStorage } from "@/lib/useStorage";
import {
	type ProfileId,
	SessionType,
	useSession,
} from "@lens-protocol/react-web";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { LoadingSpinner } from "../loading-spinner";
import { DraftView } from "../post/draft-view";
import { DraftDeleteDialog } from "./draft-delete-dialog";
import { DraftOptionsDropdown } from "./draft-options";

const fetchCloudDrafts = async () => {
	const response = await fetch("/api/drafts", {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	});
	const data = await response.json();
	return data.drafts;
};

type Draft = {
	id: string;
	content_json?: string;
	author_id?: ProfileId;
	isLocal: boolean;
};

const DraftItem = ({
	draft,
	onDelete,
}: { draft: Draft; onDelete: () => void }) => (
	<div className="relative">
		<Link href={`/write/${draft.id}`}>
			<DraftView
				draft={draft}
				authorId={draft.author_id}
				isCloud={!draft.isLocal}
			/>
		</Link>
		<div className="absolute top-2 right-2">
			<DraftOptionsDropdown onDeleteClick={onDelete} />
		</div>
	</div>
);

export const DraftsList = () => {
	const { data: session, loading: sessionLoading } = useSession();
	const { documents: localDrafts, saveDocument } = useStorage();
	const [draftToDelete, setDraftToDelete] = useState<Draft | null>(null);

	const {
		data: cloudDrafts,
		isLoading: cloudDraftsLoading,
		error: cloudDraftsError,
		refetch: refetchCloudDrafts,
	} = useQuery({
		queryKey: ["drafts"],
		queryFn: fetchCloudDrafts,
	});

	if (sessionLoading) return <LoadingSpinner />;
	if (session?.type !== SessionType.WithProfile) return null;
	if (cloudDraftsError)
		return <div>Error loading drafts: {cloudDraftsError.message}</div>;

	const handleDelete = async () => {
		if (!draftToDelete) return;

		if (draftToDelete.isLocal) {
			const updatedDocuments = { ...localDrafts };
			delete updatedDocuments[draftToDelete.id];
			saveDocument(draftToDelete.id, updatedDocuments);
			toast.success("Draft deleted successfully");
		} else {
			try {
				const res = await fetch(`/api/drafts?id=${draftToDelete.id}`, {
					method: "DELETE",
				});

				if (res.ok) {
					toast.success("Draft deleted successfully");
					refetchCloudDrafts();
				} else {
					toast.error("Failed to delete draft");
				}
			} catch (err) {
				toast.error("Error deleting draft");
			}
		}

		setDraftToDelete(null);
	};

	const cloudDraftsList =
		cloudDrafts?.map((draft: Draft) => ({ ...draft, isLocal: false })) || [];
	const localDraftsList = Object.entries(localDrafts).map(([id, content]) => ({
		id,
		content_json: content as unknown as string,
		isLocal: true,
	}));

	const allDrafts = [...cloudDraftsList, ...localDraftsList];

	return (
		<div className="space-y-4">
			{cloudDraftsLoading ? (
				<LoadingSpinner />
			) : allDrafts.length === 0 ? (
				<div>No drafts available</div>
			) : (
				allDrafts.map((draft) => (
					<DraftItem
						key={draft.id}
						draft={draft}
						onDelete={() => setDraftToDelete(draft)}
					/>
				))
			)}
			<DraftDeleteDialog
				isOpen={!!draftToDelete}
				onClose={() => setDraftToDelete(null)}
				onConfirm={handleDelete}
			/>
		</div>
	);
};
