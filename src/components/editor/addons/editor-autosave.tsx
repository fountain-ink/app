"use client";

import { extractMetadata } from "@/lib/extract-metadata";
import { Value } from "@udecode/plate-common";
import { MarkdownPlugin } from "@udecode/plate-markdown";
import { useEditorPlugin, useEditorRef, useEditorState } from "@udecode/plate/react";
import { useCallback, useEffect, useRef } from "react";
import { useDebouncedCallback } from "use-debounce";
import { toast } from "sonner";

interface AutoSaveProps {
  documentId: string;
  isCollaborative: boolean;
}

export function AutoSave({ documentId, isCollaborative }: AutoSaveProps) {
  const editor = useEditorState();
  const editorRef = useEditorRef();
  const { api: markdownApi } = useEditorPlugin(MarkdownPlugin);

  const lastSavedContentRef = useRef<string | null>(null);

  const saveContentToBackend = useCallback(
    async (currentContent: Value) => {
      if (isCollaborative || !editorRef.id || !markdownApi) { // Check editorRef.id as proxy for editor readiness
        return;
      }

      const currentContentString = JSON.stringify(currentContent);
      if (currentContentString === lastSavedContentRef.current) {
        return; // Content hasn't changed since last successful save
      }

      const savingToastId = toast.loading("Saving draft...");

      try {
        // Use editorRef.children to get the latest state within callback
        const { title, subtitle, coverUrl } = extractMetadata(editorRef.children as Value);
        const contentMarkdown = markdownApi.markdown.serialize({value: editorRef.children as Value});

        const payload = {
          contentJson: currentContent,
          title,
          subtitle,
          coverUrl,
          contentMarkdown,
        };

        const response = await fetch(`/api/drafts?id=${documentId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to save draft");
        }

        lastSavedContentRef.current = currentContentString;
        toast.success("Draft saved!", { id: savingToastId });

      } catch (error) {
        console.error("Error saving draft to backend:", error);
        toast.error("Error saving draft", {
          id: savingToastId,
          description: error instanceof Error ? error.message : "An unknown error occurred."
        });
      }
    },
    // Dependencies for useCallback:
    // documentId and isCollaborative are props and stable if component doesn't re-render often.
    // editorRef is stable. markdownApi might change if plugins reload, but typically stable.
    [documentId, isCollaborative, editorRef, markdownApi],
  );

  const debouncedSave = useDebouncedCallback(saveContentToBackend, 1500);

  useEffect(() => {
    // editor from useEditorState gives current value for comparison or triggering
    if (isCollaborative || !editor || !editor.children ) {
      return;
    }
    // The debouncedSave function will be called with the latest editor.children.
    // The actual check for changes (stringify comparison) is now inside saveContentToBackend.
    debouncedSave(editor.children as Value);

  }, [editor, editor?.children, debouncedSave, isCollaborative]);

  return null;
}
// Original UI for saving status (can be re-added if needed, but toasts are used now)
// return (
//   <AnimatePresence>
  //     {/* isVisible equivalent would be derived from toast states or a local state if needed */}
  //     {/* <motion.div
  //         initial={{ opacity: 0, y: 10 }}
  //         animate={{ opacity: 1, y: 0 }}
  //         exit={{ opacity: 0, y: 10 }}
  //         className="fixed bottom-4 right-4 flex items-center gap-2 rounded-md bg-background px-4 py-2 text-sm shadow-lg"
  //       > */}
  //         {/* {isSaving ? ( // Replace with toast logic or similar
  //           <>
  //             <LoadingSpinner size={16} />
  //             <span>Saving...</span>
  //           </>
  //         ) : (
  //           <>
  //             <CheckIcon className="h-4 w-4 text-green-500" />
  //             <span>Saved</span>
  //           </>
  //         )} */}
  //       {/* </motion.div> */}
  //     {/* )} */}
  //   {/* </AnimatePresence> */}
  // );
// }
