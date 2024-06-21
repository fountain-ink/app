"use client";
import { NodeSelector } from "./selectors/NodeSelector";

import { ColorSelector } from "./selectors/ColorSelector";

import {
	EditorBubble,
	EditorBubbleItem,
	EditorCommand,
	EditorCommandEmpty,
	EditorCommandItem,
	EditorContent,
	EditorRoot,
} from "novel";
import { useState } from "react";
import { defaultExtensions } from "./extensions/NovelExtensions";
import { slashCommand, suggestionItems } from "./extensions/SlashCommand";
import { LinkSelector } from "./selectors/LinkSelector";
import { TextButtons } from "./selectors/TextSelector";

const extensions = [...defaultExtensions, slashCommand];

export default () => {
	const [openNode, setOpenNode] = useState(false);
	const [openLink, setOpenLink] = useState(false);
	const [openColor, setOpenColor] = useState(false);
	const [openAI, setOpenAI] = useState(false);

	return (
		<EditorRoot >
			<EditorContent
     initialContent={{}} 
				editorProps={{

					attributes: {
						class:
							"prose prose-sm sm:prose-base lg:prose-lg m-5 focus:outline-none rounded-lg p-8",
					},
				}}
				className=""
				extensions={extensions}
			>
				<EditorCommand className="z-50 h-auto max-h-[330px]  w-72 overflow-y-auto rounded-md border border-muted bg-background px-1 py-2 shadow-md transition-all">
					<EditorCommandEmpty className="px-2 text-muted-foreground">
						No results
					</EditorCommandEmpty>
					{suggestionItems.map((item) => (
						<EditorCommandItem
							value={item.title}
							onCommand={(val) => item.command?.(val) ?? null}
							className={
								"flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-accent "
							}
							key={item.title}
						>
							<div className="flex h-10 w-10 items-center justify-center rounded-md border border-muted bg-background">
								{item.icon}
							</div>
							<div>
								<p className="font-medium">{item.title}</p>
								<p className="text-xs text-muted-foreground">
									{item.description}
								</p>
							</div>
						</EditorCommandItem>
					))}
				</EditorCommand>
				<EditorBubble
					tippyOptions={{
						placement: openAI ? "bottom-start" : "top",
					}}
					className="flex w-fit max-w-[90vw] overflow-hidden rounded border border-muted bg-background shadow-xl"
				>
					<NodeSelector open={openNode} onOpenChange={setOpenNode} />
					<LinkSelector open={openLink} onOpenChange={setOpenLink} />
					<TextButtons />
					<ColorSelector open={openColor} onOpenChange={setOpenColor} />
				</EditorBubble>
			</EditorContent>
		</EditorRoot>
	);
};
