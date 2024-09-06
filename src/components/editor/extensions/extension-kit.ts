"use client";

import type { HocuspocusProvider } from "@hocuspocus/provider";
import CharacterCount from "@tiptap/extension-character-count";
import Color from "@tiptap/extension-color";
import Document from "@tiptap/extension-document";
import Dropcursor from "@tiptap/extension-dropcursor";
import Focus from "@tiptap/extension-focus";
import FontFamily from "@tiptap/extension-font-family";
import Heading from "@tiptap/extension-heading";
import Highlight from "@tiptap/extension-highlight";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import ImageBlock from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import TextAlign from "@tiptap/extension-text-align";
import TextStyle from "@tiptap/extension-text-style";
import Typography from "@tiptap/extension-typography";
import Underline from "@tiptap/extension-underline";
import StarterKit from "@tiptap/starter-kit";
import BlockquoteFigure from "./blockquote-figure";
import Figcaption from "./figcaption";
import FontSize from "./font-size";
import { Selection } from "./selection";
import { TrailingNode } from "./trailing-node";
// import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight'
// import { ImageUpload } from './ImageUpload'
// import { TableOfContentsNode } from './TableOfContentsNode'
// import { lowlight } from 'lowlight'



interface ExtensionKitProps {
	provider?: HocuspocusProvider | null;
	userId?: string;
	userName?: string;
	userColor?: string;
}

export const ExtensionKit = ({
	provider,
	userId,
	userName = "Maxi",
}: ExtensionKitProps) => [
	Document,
	// Column,
	// Columns,
	TaskList,
	TaskItem.configure({
		nested: true,
	}),
	// AiWriter.configure({
	//   authorId: userId,
	//   authorName: userName,
	// }),
	// AiImage.configure({
	//   authorId: userId,
	//   authorName: userName,
	// }),
	Selection,
	Heading.configure({
		levels: [1, 2, 3, 4, 5, 6],
	}),
	HorizontalRule,
	StarterKit.configure({
		document: false,
		dropcursor: false,
		heading: false,
		horizontalRule: false,
		blockquote: false,
		history: false,
		codeBlock: false,
	}),
	// CodeBlockLowlight.configure({
	// 	lowlight,
	// 	defaultLanguage: null,
	// }),
	TextStyle,
	FontSize,
	FontFamily,
	Color,
	TrailingNode,
	Link.configure({
		openOnClick: false,
	}),
	Highlight.configure({ multicolor: true }),
	Underline,
	CharacterCount.configure({ limit: 50000 }),
	// TableOfContents,
	// TableOfContentsNode,
	// ImageUpload.configure({
	// 	clientId: provider?.document?.clientID,
	// }),
	ImageBlock,
	// FileHandler.configure({
	// 	allowedMimeTypes: ["image/png", "image/jpeg", "image/gif", "image/webp"],
	// 	onDrop: (currentEditor, files, pos) => {
	// 		files.forEach(async () => {
	// 			const url = await API.uploadImage();

	// 			currentEditor.chain().setImageBlockAt({ pos, src: url }).focus().run();
	// 		});
	// 	},
	// 	onPaste: (currentEditor, files) => {
	// 		files.forEach(async () => {
	// 			const url = await API.uploadImage();

	// 			return currentEditor
	// 				.chain()
	// 				.setImageBlockAt({
	// 					pos: currentEditor.state.selection.anchor,
	// 					src: url,
	// 				})
	// 				.focus()
	// 				.run();
	// 		});
	// 	},
	// }),
	// Emoji.configure({
	// 	enableEmoticons: true,
	// 	suggestion: emojiSuggestion,
	// }),
	TextAlign.extend({
		addKeyboardShortcuts() {
			return {};
		},
	}).configure({
		types: ["heading", "paragraph"],
	}),
	Subscript,
	Superscript,
	Table,
	TableCell,
	TableHeader,
	TableRow,
	Typography,
	Placeholder.configure({
		includeChildren: true,
		showOnlyCurrent: false,
		placeholder: () => "",
	}),
	// SlashCommand,
	Focus,
	Figcaption,
	BlockquoteFigure,
	Dropcursor.configure({
		width: 2,
		class: "ProseMirror-dropcursor border-black",
	}),
];

export default ExtensionKit;
