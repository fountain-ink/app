"use client";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { Editor } from "@/components/editor/Editor";
import { EditorCollaborators } from "@/components/editor/EditorCollaborators";
import { EditorDate } from "@/components/editor/EditorDate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";

interface UnifiedContent {
	title: string;
	subtitle?: string;
	content: string;
	coverImage?: string;
	createdAt: number;
	preview?: string;
	slug: string;
	platformSpecific?: any;
}

const ContentFetcher: React.FC = () => {
	const [url, setUrl] = useState("");
	const [content, setContent] = useState<UnifiedContent | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

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
			const data = await response.json();
			setContent(data);
		} catch (err) {
			setError("Error fetching content. Please try again.");
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex min-h-screen flex-col items-center justify-center text-foreground bg-background">
			<div className="container flex flex-col items-center justify-center w-full max-w-lg md:max-w-xl lg:max-w-2xl lg:max-w-4xl ">
				<div className="w-full min-h-screen py-4">
					<ThemeSwitcher />

					<Card className="w-full max-w-2xl mx-auto">
						<CardHeader>
							<CardTitle>Content Fetcher</CardTitle>
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
							{content && (
								<div>
									<h2 className="text-xl font-bold mb-2">{content.title}</h2>
									{content.subtitle && (
										<h3 className="text-lg mb-2">{content.subtitle}</h3>
									)}
									{content.coverImage && (
										<img
											src={content.coverImage}
											alt="Cover"
											className="mb-4 max-w-full h-auto"
										/>
									)}
									<p className="mb-2">
										{new Date(content.createdAt).toLocaleDateString()}
									</p>
									{content.preview && <p className="mb-4">{content.preview}</p>}
									<div dangerouslySetInnerHTML={{ __html: content.content }} />
								</div>
							)}
						</CardContent>
					</Card>
					<EditorDate />
					<EditorCollaborators />
					<Editor />
				</div>
			</div>
		</div>
	);
};

export default ContentFetcher;
