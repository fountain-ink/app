"use client"
import { Editor } from "@tiptap/react";

export const EditorMenu = ({ editor }: { editor: Editor | null }) => {
	if (!editor) {
		return null;
	}

	return (
		<div className="flex flex-wrap gap-2">
			<button
				type="button"
				onClick={() => editor.chain().focus().toggleBold().run()}
				disabled={!editor.can().chain().focus().toggleBold().run()}
				className={editor.isActive("bold") ? "is-active" : ""}
			>
				Bold
			</button>
			<button
				type="button"
				onClick={() => editor.chain().focus().toggleItalic().run()}
				disabled={!editor.can().chain().focus().toggleItalic().run()}
				className={editor.isActive("italic") ? "is-active" : ""}
			>
				Italic
			</button>
			<button
				type="button"
				onClick={() => editor.chain().focus().toggleStrike().run()}
				disabled={!editor.can().chain().focus().toggleStrike().run()}
				className={editor.isActive("strike") ? "is-active" : ""}
			>
				Strike
			</button>
			<button
				type="button"
				onClick={() => editor.chain().focus().toggleCode().run()}
				disabled={!editor.can().chain().focus().toggleCode().run()}
				className={editor.isActive("code") ? "is-active" : ""}
			>
				Code
			</button>
			<button
				type="button"
				onClick={() => editor.chain().focus().unsetAllMarks().run()}
			>
				Clear marks
			</button>
			<button
				type="button"
				onClick={() => editor.chain().focus().clearNodes().run()}
			>
				Clear nodes
			</button>
			<button
				type="button"
				onClick={() => editor.chain().focus().setParagraph().run()}
				className={editor.isActive("paragraph") ? "is-active" : ""}
			>
				Paragraph
			</button>
			<button
				type="button"
				onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
				className={editor.isActive("heading", { level: 1 }) ? "is-active" : ""}
			>
				H1
			</button>
			<button
				type="button"
				onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
				className={editor.isActive("heading", { level: 2 }) ? "is-active" : ""}
			>
				H2
			</button>
			<button
				type="button"
				onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
				className={editor.isActive("heading", { level: 3 }) ? "is-active" : ""}
			>
				H3
			</button>
			<button
				type="button"
				onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
				className={editor.isActive("heading", { level: 4 }) ? "is-active" : ""}
			>
				H4
			</button>
			<button
				type="button"
				onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
				className={editor.isActive("heading", { level: 5 }) ? "is-active" : ""}
			>
				H5
			</button>
			<button
				type="button"
				onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
				className={editor.isActive("heading", { level: 6 }) ? "is-active" : ""}
			>
				H6
			</button>
			<button
				type="button"
				onClick={() => editor.chain().focus().toggleBulletList().run()}
				className={editor.isActive("bulletList") ? "is-active" : ""}
			>
				Bullet list
			</button>
			<button
				type="button"
				onClick={() => editor.chain().focus().toggleOrderedList().run()}
				className={editor.isActive("orderedList") ? "is-active" : ""}
			>
				Ordered list
			</button>
			<button
				type="button"
				onClick={() => editor.chain().focus().toggleCodeBlock().run()}
				className={editor.isActive("codeBlock") ? "is-active" : ""}
			>
				Code block
			</button>
			<button
				type="button"
				onClick={() => editor.chain().focus().toggleBlockquote().run()}
				className={editor.isActive("blockquote") ? "is-active" : ""}
			>
				Blockquote
			</button>
			<button
				type="button"
				onClick={() => editor.chain().focus().setHorizontalRule().run()}
			>
				Horizontal rule
			</button>
			<button
				type="button"
				onClick={() => editor.chain().focus().setHardBreak().run()}
			>
				Hard break
			</button>
			<button
				type="button"
				onClick={() => editor.chain().focus().undo().run()}
				disabled={!editor.can().chain().focus().undo().run()}
			>
				Undo
			</button>
			<button
				type="button"
				onClick={() => editor.chain().focus().redo().run()}
				disabled={!editor.can().chain().focus().redo().run()}
			>
				Redo
			</button>
			{/* <button type="button"
				onClick={() => editor.chain().focus().setColor("#958DF1").run()}
				className={
					editor.isActive("textStyle", { color: "#958DF1" }) ? "is-active" : ""
				}
			>
				Purple
			</button> */}
		</div>
	);
};
