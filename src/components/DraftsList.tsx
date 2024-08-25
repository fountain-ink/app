"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRefreshToken } from "@lens-protocol/react-web";
import { useQuery } from "@tanstack/react-query";
import { FileEditIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const fetchDrafts = async ({
	queryKey,
}: { queryKey: [string, string | null] }) => {
	const [_, token] = queryKey;
	if (!token) {
		return [];
	}

	const response = await fetch("/api/drafts", {
		method: "GET",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
	})
		.then((res) => res.json())
		.catch((err) => toast.error(err));

	const { drafts } = response;

	return drafts;
};

export const DraftsList = () => {
	const refreshToken = useRefreshToken();
	const {
		data: drafts,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["drafts", refreshToken],
		queryFn: fetchDrafts,
	});

	if (isLoading) return <Skeleton className="w-full h-24" />;
	if (error) return <div>Error loading drafts: {error.message}</div>;
	if (!drafts || drafts.length === 0) return <div>No drafts available</div>;

	return (
		<div className="space-y-2">
			{drafts.map((draft: { id: string; title: string }) => (
				<Button key={draft.id} variant="ghost" className="w-full justify-start">
					<Link href={`/write/${draft.id}`} className="flex gap-2 text-md">
						<FileEditIcon className="h-5 w-5" />
						{draft.title || "Untitled Draft"}
					</Link>
				</Button>
			))}
		</div>
	);
};
