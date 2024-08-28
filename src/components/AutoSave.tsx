"use client";

import { useRefreshToken } from "@lens-protocol/react-web";
import { useEditor } from "novel";
import { useCallback, useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";

export function AutoSave({ documentId }: { documentId: string | undefined }) {
	const { editor } = useEditor();
	const refreshToken = useRefreshToken();

	const saveContent = useCallback(
		async (content_json: object) => {
			try {
				const response = await fetch(`/api/drafts?id=${documentId}`, {
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: refreshToken || "",
					},
					body: JSON.stringify({ content: content_json }),
				});
				console.log(response);

				if (!response.ok) {
					throw new Error(`${response.status} ${response.statusText}`);
				}
			} catch (error) {
				console.error("Error saving draft:", error);
			}
		},
		[documentId, refreshToken],
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
