"use client";
import { ContentPreview } from "@/components/editor/ContentPreivew";
import { Editor } from "@/components/editor/Editor";
import { EditorCollaborators } from "@/components/editor/EditorCollaborators";
import { EditorDate } from "@/components/editor/EditorDate";

const preview = () => {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center text-foreground bg-background">
			<div className="container flex flex-col items-center justify-center w-full max-w-lg md:max-w-xl lg:max-w-2xl lg:max-w-4xl ">
				<div className="w-full min-h-screen py-4">
					{/* <ThemeSwitcher /> */}
					<EditorDate />
					<EditorCollaborators />
					<Editor>
						<ContentPreview />
					</Editor>
				</div>
			</div>
		</div>
	);
};

export default preview;
