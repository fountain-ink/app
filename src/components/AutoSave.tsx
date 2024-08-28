"use client";

import { useEditor } from "novel";
import { useCallback, useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";

export function AutoSave({ documentId }: { documentId: string | undefined }) {
	const { editor } = useEditor();

	const saveContent = useCallback(
		async (content_json: object) => {
			try {
				const response = await fetch(`/api/drafts?id=${documentId}`, {
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ content: content_json }),
				});

				if (!response.ok) {
					throw new Error(`${response.status} ${response.statusText}`);
				}
			} catch (error) {
				console.error("Error saving draft:", error);
			}
		},
		[documentId],
	);

	const debouncedSave = useDebouncedCallback(saveContent, 5000);

	useEffect(() => {
		if (editor) {
			editor.on("update", ({ editor }) => {
				const content = editor.getJSON();
				debouncedSave(content);
			});
		}

		return () => {
			if (editor) {
				editor.off("update");
			}
		};
	}, [editor, debouncedSave]);

	return null;
}
