"use client";

import { editorExtensionsList } from "@/components/editor/Editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useEditor } from "@tiptap/react";
import { ChevronDown } from "lucide-react";
import React, { useState } from "react";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "../ui/collapsible";

interface ForeignContent {
	title: string;
	subtitle?: string;
	content: string;
	coverImage?: string;
	createdAt: number;
	preview?: string;
	slug: string;
}
export const ContentPreview = () => {
	const [url, setUrl] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const editor = useEditor({ extensions: editorExtensionsList });

	const fetchContent = async () => {
		setLoading(true);
		setError(null);
		try {
			const response = await fetch(
				`/api/foreignContent?url=${encodeURIComponent(url)}`,
			);
			if (!response.ok) {
				throw new Error("Failed to fetch content");
			}
			const data: ForeignContent = await response.json();
			editor?.commands.setContent(data.content);
		} catch (err) {
			setError("Error fetching content. Please try again.");
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Card className="w-full max-w-2xl my-8 mx-auto drop-shadow-lg">
			<CardHeader>
				<CardTitle className="text-2xl font-bold text-center">
					Preview Your content on Fountain
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="flex space-x-2 mb-4">
					<Input
						type="text"
						value={url}
						onChange={(e) => setUrl(e.target.value)}
						placeholder="Enter URL"
						className="flex-grow"
					/>
					<Button onClick={fetchContent} disabled={loading}>
						{loading ? "Loading..." : "Import"}
					</Button>
				</div>
				{error && <p className="text-red-500 mb-4">{error}</p>}
				<Collapsible>
					<CollapsibleTrigger className="rounded-lg border p-2 flex items-center gap-2">
						example links
					</CollapsibleTrigger>
					<CollapsibleContent>
						<ul>
							<li>https://paragraph.xyz/@cstreet/impact-shadows</li>
							<li>https://paragraph.xyz/@daopunks/weekly-update-752024</li>
							<li>https://app.t2.world/article/clyn8v54m146178720mcyo4fd9fv</li>
							<li>https://app.t2.world/article/cltbrml5c1130221zmc6hqd6uvq</li>
							<li>
								https://zksync.mirror.xyz/BqdsMuLluf6AlWBgWOKoa587eQcFZq20zTf7dYblxsU
							</li>
							<li>
								https://mirror.xyz/filarm.eth/dLolcroQ98JRhVxNpZHOwI1C1E6ecCqLfFFNJ7UgArE
							</li>
						</ul>
					</CollapsibleContent>
				</Collapsible>
			</CardContent>
		</Card>
	);
};
