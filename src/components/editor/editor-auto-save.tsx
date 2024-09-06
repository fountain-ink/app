"use client";

import { useStorage } from "@/lib/useStorage";
import { AnimatePresence, motion } from "framer-motion";
import { CheckIcon } from "lucide-react";
import { useEditor } from "novel";
import { useCallback, useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { LoadingSpinner } from "../loading-spinner";

export function AutoSave({ documentId }: { documentId?: string }) {
	const { editor } = useEditor();
	const [isSaving, setIsSaving] = useState(false);
	const [saveSuccess, setSaveSuccess] = useState(false);
	const [isVisible, setIsVisible] = useState(false);
	const { saveDocument } = useStorage();

	const saveContent = useCallback(
		async (content_json: object) => {
			setIsSaving(true);
			setIsVisible(true);
			setSaveSuccess(false);
			try {
				if (documentId) {
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
				} else {
					// Save to local storage if no documentId is provided
					saveDocument(`local-draft-${Date.now()}`, content_json);
				}
				setSaveSuccess(true);
				setTimeout(() => {
					setIsVisible(false);
				}, 2000);
			} catch (error) {
				console.error("Error saving draft:", error);
			} finally {
				setIsSaving(false);
			}
		},
		[documentId, saveDocument],
	);

	const debouncedSave = useDebouncedCallback(saveContent, 1000);

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

	return (
		<div className="fixed bottom-4 right-4 z-50">
			<AnimatePresence>
				{isVisible && (
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.95 }}
						transition={{ duration: 0.3 }}
						className="opacity-50 rounded-full p-2"
					>
						{isSaving && <LoadingSpinner className="w-6 h-6 " />}
						{saveSuccess && <CheckIcon className="w-6 h-6" />}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
