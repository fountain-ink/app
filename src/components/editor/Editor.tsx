"use client";
import { env } from "@/env";
import { TiptapCollabProvider } from "@hocuspocus/provider";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import {
	EditorBubble,
	EditorBubbleItem,
	EditorCommand,
	EditorCommandEmpty,
	EditorCommandItem,
	EditorCommandList,
	EditorContent,
	EditorRoot,
} from "novel";
import { useState } from "react";
import * as Y from "yjs";
import { defaultExtensions } from "./extensions/EditorExtensions";
import { slashCommand, suggestionItems } from "./extensions/SlashCommand";

import { ColorSelector } from "./selectors/ColorSelector";
import { LinkSelector } from "./selectors/LinkSelector";
import { NodeSelector } from "./selectors/NodeSelector";
import { TextButtons } from "./selectors/TextSelector";

import "@/styles/prosemirror.css";

const token = env.NEXT_PUBLIC_HOCUSPOCUS_JWT_TOKEN;
const colors = ["#958DF1", "#F98181", "#FBBC88", "#FAF594"];
const names = ["Lea Thompson", "Cyndi Lauper", "Tom Cruise", "Madonna"];

const getRandomElement = (list: string[]) =>
	list[Math.floor(Math.random() * list.length)];
const getRandomColor = () => getRandomElement(colors);
const getRandomName = () => getRandomElement(names);

const getInitialUser = () => {
	return {
		name: getRandomName(),
		color: getRandomColor(),
	};
};

const document = new Y.Doc();

const provider = new TiptapCollabProvider({
	name: "document5",
	appId: "v91rwzmo", //`baseURL` for on-premises
	token,
	document,
});

const extensions = [
	...defaultExtensions,
	slashCommand,
	Collaboration.configure({
		document: document,
	}),
	CollaborationCursor.configure({
		provider,
		user: getInitialUser(),
	}),
];

export const Editor = () => {
	const [openNode, setOpenNode] = useState(false);
	const [openLink, setOpenLink] = useState(false);
	const [openColor, setOpenColor] = useState(false);
	const [openAI, setOpenAI] = useState(false);

	return (
		<EditorRoot>
			<EditorContent
				editorProps={{
					attributes: {
						class:
							"prose prose-sm sm:prose-base lg:prose-lg focus:outline-none rounded-lg",
					},
				}}
				extensions={extensions}
			>
				<EditorCommand className="z-50 h-auto max-h-[330px]  w-72 overflow-y-auto rounded-md border border-muted bg-background px-1 py-2 shadow-md transition-all">
					<EditorCommandEmpty className="px-2 text-muted-foreground">
						No results
					</EditorCommandEmpty>
					<EditorCommandList>
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
					</EditorCommandList>
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
