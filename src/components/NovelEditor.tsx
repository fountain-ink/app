"use client";
import {
	EditorBubble,
	EditorBubbleItem,
	EditorCommand,
	EditorCommandEmpty,
	EditorCommandItem,
	EditorContent,
	EditorRoot,
} from "novel";
import { defaultExtensions } from "./extensions/NovelExtensions";
import { slashCommand, suggestionItems } from "./extensions/SlashCommand";

const extensions = [...defaultExtensions, slashCommand];

export default () => (
	<EditorRoot>
		<EditorContent extensions={extensions}>
			<EditorCommand className="z-50 h-auto max-h-[330px]  w-72 overflow-y-auto rounded-md border border-muted bg-background px-1 py-2 shadow-md transition-all">
				<EditorCommandEmpty className="px-2 text-muted-foreground">
					No results
				</EditorCommandEmpty>
				{suggestionItems.map((item) => (
					<EditorCommandItem
						value={item.title}
						onCommand={(val) => item.command(val)}
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
			<EditorBubble>
				boop
				{/* <EditorBubbleItem />
        <EditorBubbleItem />
        <EditorBubbleItem /> */}
			</EditorBubble>
		</EditorContent>
	</EditorRoot>
);
