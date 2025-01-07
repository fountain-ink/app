"use client";

import { Button } from "@/components/ui/button";
import { useDocumentStorage } from "@/hooks/use-document-storage";
import { uploadMetadata } from "@/lib/upload/upload-metadata";
import { MetadataAttributeType, article } from "@lens-protocol/metadata";
import { SessionType, useCreatePost, useSession } from "@lens-protocol/react-web";
import { useQueryClient } from "@tanstack/react-query";
import { createPlateEditor, useEditorState } from "@udecode/plate-common/react";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { getElements } from "../elements";
import { staticPlugins } from "../plugins";

export const PublishButton = ({
  disabled,
  tags,
  title,
  subtitle,
  coverImage,
}: { disabled?: boolean; tags?: string[]; title?: string; subtitle?: string; coverImage?: string }) => {
  const { data: session } = useSession();
  const { isConnected: isWalletConnected } = useAccount();
  const { execute } = useCreatePost();
  const editorState: any = useEditorState();
  const router = useRouter();
  const { deleteDocument } = useDocumentStorage();
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const isLocal = pathname.includes("local");
  const documentId = pathname.split("/").at(-1);

  const editor = useMemo(() => {
    return createPlateEditor({
      plugins: staticPlugins?.filter((plugin: any) => plugin?.key !== "toggle" && plugin?.key !== "blockSelection"),
      override: { components: getElements() },
    });
  }, []);

  const handlePublish = async () => {
    if (session?.type !== SessionType.WithProfile || !isWalletConnected) {
      toast.error("Please log in to publish");
      return;
    }

    if (!editor) {
      toast.error("Editor not initialized");
      return;
    }

    const handle = session?.profile?.handle?.localName || "";
    const contentJson = editorState.children;
    const contentHtml = editor.api.htmlReact?.serialize({
      nodes: editorState.children,
      stripDataAttributes: true,
      preserveClassNames: [],
      stripWhitespace: true,
      dndWrapper: (props: any) => <DndProvider context={window} backend={HTML5Backend} {...props} />,
    });

    const contentMarkdown = editorState.api.markdown.serialize();
    // const { title, subtitle, coverImage } = extractMetadata(contentJson);

    try {
      const metadata = article({
        title,
        content: contentMarkdown,
        locale: "en",
        tags,
        appId: "fountain",
        attributes: [
          { key: "contentJson", type: MetadataAttributeType.JSON, value: JSON.stringify(contentJson) },
          { key: "contentHtml", type: MetadataAttributeType.STRING, value: contentHtml },
          { key: "subtitle", type: MetadataAttributeType.STRING, value: subtitle ?? "" },
        ],
      });

      const publish = false;
      if (!publish) {
        console.log(metadata);
        return;
      }

      const metadataURI = await uploadMetadata(metadata);
      // Show initial toast that transaction is being processed
      const pendingToast = toast.loading("Publishing post...");

      const result = await execute({
        metadata: metadataURI,
      });

      if (result.isFailure()) {
        toast.dismiss(pendingToast);
        toast.error(`Failed to create post: ${result.error.message}`);
        return;
      }

      // Update toast to show transaction is being mined/indexed
      toast.loading("Finalizing on-chain...", {
        id: pendingToast,
      });

      const completion = await result.value.waitForCompletion();

      if (completion.isFailure()) {
        toast.dismiss(pendingToast);
        switch (completion.error.reason) {
          case "MINING_TIMEOUT":
            toast.error("Transaction was not mined within the timeout period");
            break;
          case "INDEXING_TIMEOUT":
            toast.error("Transaction was mined but not indexed within timeout period");
            break;
          case "REVERTED":
            toast.error("Transaction was reverted");
            break;
          default:
            toast.error("Unknown error occurred while processing transaction");
        }
        return;
      }

      const post = completion.value;

      // Clean up drafts
      if (isLocal) {
        deleteDocument(documentId || "");
      } else {
        try {
          const res = await fetch(`/api/drafts?id=${documentId}`, {
            method: "DELETE",
          });

          if (res.ok) {
            queryClient.invalidateQueries({
              queryKey: ["drafts"],
              refetchType: "active",
            });
          } else {
            console.error("Failed to delete cloud draft after publication");
          }
        } catch (error) {
          console.error("Error deleting cloud draft:", error);
        }
      }

      // Show success and redirect
      toast.dismiss(pendingToast);
      toast.success("Post published successfully!");

      // Route to post page
      router.push(`/u/${handle}/${post.id}`);
      router.refresh();
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("An error occurred while creating the post. See console for details");
    }
  };

  return (
    <Button disabled={disabled} onClick={handlePublish}>
      Publish
    </Button>
  );
};
