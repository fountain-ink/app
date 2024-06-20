"use client";

import { env } from "@/env";
import { TiptapCollabProvider } from "@hocuspocus/provider";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import { EditorContent, useEditor } from "@tiptap/react";
import { useCallback, useEffect, useState } from "react";
import * as Y from "yjs";
import { EditorMenu } from "./EditorMenu";
import ExtensionKit from "./extensions/ExtensionKit";

const hocuspocusToken = env.NEXT_PUBLIC_HOCUSPOCUS_JWT_TOKEN;

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

const doc = new Y.Doc();

const provider = new TiptapCollabProvider({
	name: "document2", // Unique document identifier for syncing.
	appId: "v91rwzmo", // Cloud Dashboard AppID or `baseURL` for on-premises
	token: hocuspocusToken, // JWT token
	document: doc,
});

const Tiptap = () => {
	const [status, setStatus] = useState("connecting");
	const [currentUser, setCurrentUser] = useState(getInitialUser);

	useEffect(() => {
		// Update status changes
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		provider.on("status", (event: any) => {
			console.log(event);
			setStatus(event.status);
		});
	}, []);

	// useEffect(() => {
	// 		if (editor && currentUser) {
	// 			localStorage.setItem("currentUser", JSON.stringify(currentUser));
	// 			editor.chain().focus().updateUser(currentUser).run();
	// 		}
	// 	}, [editor, currentUser]);

	const setName = useCallback(() => {
		const name = (window.prompt("Name") ?? "").trim().substring(0, 32);

		if (name) {
			return setCurrentUser({ ...currentUser, name });
		}
	}, [currentUser]);

	const editor = useEditor({
		extensions: [
			// StarterKit.configure({
			// 	history: false,
			// }),
			// Highlight,
			// TaskList,
			// TaskItem,
			// CharacterCount.configure({
			// 	limit: 10000,
			// }),
			// Collaboration.configure({
			// 	document: doc,
			// }),
			// CollaborationCursor.configure({
			// 	provider,
			// }),

			...ExtensionKit({
				provider,
			}),
			Collaboration.configure({
				document: doc,
			}),
			CollaborationCursor.configure({
				provider,
				user: {
					name: getRandomElement(names),
					color: getRandomElement(colors),
				},
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
			<EditorMenu editor={editor} />
			<EditorContent editor={editor} />
		</>
	);
};

export default Tiptap;
