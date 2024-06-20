"use client";

import { Color } from "@tiptap/extension-color";
import Document from "@tiptap/extension-document";
import ListItem from "@tiptap/extension-list-item";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import TextStyle from "@tiptap/extension-text-style";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import { TiptapCollabProvider } from "@hocuspocus/provider";
import Collaboration from "@tiptap/extension-collaboration";
import * as Y from "yjs";
import { env } from "~/env";
import { EditorMenu } from "./EditorMenu";

const hocuspocusToken = env.NEXT_PUBLIC_HOCUSPOCUS_JWT_TOKEN;

const TiptapCollab = () => {
	const doc = new Y.Doc();

	const provider = new TiptapCollabProvider({
		name: "document.name", // Unique document identifier for syncing.
		appId: "v91rwzmo", // Cloud Dashboard AppID or `baseURL` for on-premises
		token: hocuspocusToken, // JWT token
		document: doc,

		// The onSynced callback ensures initial content is set only once using editor.setContent(), preventing repetitive content insertion on editor syncs.
		onSynced() {
			if (!doc.getMap("config").get("initialContentLoaded") && editor) {
				doc.getMap("config").set("initialContentLoaded", true);

				editor.commands.setContent(`fountastic!`);
			}
		},
	});

	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				history: false,
			}),
			Paragraph,
			Document,
			Color.configure({ types: [TextStyle.name, ListItem.name] }),
			// TextStyle.configure({ types: [ListItem.name] }),
			StarterKit.configure({
				bulletList: {
					keepMarks: true,
					keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
				},
				orderedList: {
					keepMarks: true,
					keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
				},
			}),

			Text,
			Collaboration.configure({
				document: doc, // Configure Y.Doc for collaboration
			}),
		],
		editorProps: {
			attributes: {
				class:
					"prose prose-sm sm:prose-base lg:prose-lg m-5 focus:outline-none rounded-lg p-8",
			},
		},
	});

	return (
		<>
			<EditorContent editor={editor} />
		</>
	);
};

export default TiptapCollab;
