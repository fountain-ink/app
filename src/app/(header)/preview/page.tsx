"use client";

import { ContentPreview } from "@/components/editor/ContentPreivew";
import { Editor } from "@/components/editor/Editor";

const preview = () => {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center text-foreground bg-background">
			<div className="container flex flex-col items-center justify-center w-fit ">
				<div className="w-full min-h-screen py-4">
					<Editor>
						<ContentPreview />
					</Editor>
				</div>
			</div>
		</div>
	);
};

export default preview;
