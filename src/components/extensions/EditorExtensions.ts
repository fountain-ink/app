"use client";
import {
	HorizontalRule,
	Placeholder,
	StarterKit,
	TaskItem,
	TaskList,
	TiptapImage,
	TiptapLink,
	UpdatedImage,
} from "novel/extensions";

import { cx } from "class-variance-authority";

const placeholder = Placeholder;
const tiptapLink = TiptapLink.configure({
	HTMLAttributes: {
		class: cx(
			"text-muted-foreground underline underline-offset-[3px] hover:text-primary transition-colors cursor-pointer",
		),
	},
});

const taskList = TaskList.configure({
	HTMLAttributes: {
		class: cx("not-prose pl-2"),
	},
});
const taskItem = TaskItem.configure({
	HTMLAttributes: {
		class: cx("flex items-start my-4"),
	},
	nested: true,
});

const horizontalRule = HorizontalRule.configure({
	HTMLAttributes: {
		class: cx("mt-4 mb-6 border-t border-muted-foreground"),
	},
});

const starterKit = StarterKit.configure({
	history: false,
	bulletList: {
		HTMLAttributes: {
			class: cx("list-disc list-outside leading-3 -mt-2"),
		},
	},
	orderedList: {
		HTMLAttributes: {
			class: cx("list-decimal list-outside leading-3 -mt-2"),
		},
	},
	listItem: {
		HTMLAttributes: {
			class: cx("leading-normal -mb-2"),
		},
	},
	blockquote: {
		HTMLAttributes: {
			class: cx("border-l-4 border-primary"),
		},
	},
	codeBlock: {
		HTMLAttributes: {
			class: cx("rounded-sm bg-muted border p-5 font-mono font-medium"),
		},
	},
	code: {
		HTMLAttributes: {
			class: cx("rounded-md bg-muted  px-1.5 py-1 font-mono font-medium"),
			spellcheck: "false",
		},
	},
	horizontalRule: false,
	dropcursor: {
		color: "#DBEAFE",
		width: 4,
	},
	gapcursor: false,
});

export const defaultExtensions = [
	starterKit,
	placeholder,
	TiptapLink,
	UpdatedImage,
	taskList,
	taskItem,
	horizontalRule,
];
