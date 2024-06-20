"use client";

import CharacterCount from "@tiptap/extension-character-count";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import Highlight from "@tiptap/extension-highlight";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import { TiptapCollabProvider } from "@hocuspocus/provider";
import { useCallback, useEffect, useState } from "react";
import * as Y from "yjs";
import { env } from "~/env";
import { EditorMenu } from "./EditorMenu";

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
	name: "document.name", // Unique document identifier for syncing.
	appId: "v91rwzmo", // Cloud Dashboard AppID or `baseURL` for on-premises
	token: hocuspocusToken, // JWT token
	document: doc,
});

const TiptapCollab = () => {
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

	useEffect(() => {
		if (editor && currentUser) {
			localStorage.setItem("currentUser", JSON.stringify(currentUser));
			editor.chain().focus().updateUser(currentUser).run();
		}
	}, [currentUser]);

	const setName = useCallback(() => {
		const name = (window.prompt("Name") || "").trim().substring(0, 32);

		if (name) {
			return setCurrentUser({ ...currentUser, name });
		}
	}, [currentUser]);

	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				history: false,
			}),
			Highlight,
			TaskList,
			TaskItem,
			CharacterCount.configure({
				limit: 10000,
			}),
			Collaboration.configure({
				document: doc,
         
			}),
			CollaborationCursor.configure({
				provider,
        
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
			{/* <EditorMenu editor={editor} /> */}
			<EditorContent editor={editor} />
		</>
	);
};

export default TiptapCollab;
