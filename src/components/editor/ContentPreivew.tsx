"use client";

import { editorExtensionsList } from "@/components/editor/Editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useEditor } from "@tiptap/react";
import React, { useState } from "react";

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
		<Card className="w-full max-w-2xl my-8 mx-auto">
			<CardHeader>
				<CardTitle>Fountain Preview</CardTitle>
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
						{loading ? "Loading..." : "Fetch"}
					</Button>
				</div>
				{error && <p className="text-red-500 mb-4">{error}</p>}
			</CardContent>
		</Card>
	);
};
