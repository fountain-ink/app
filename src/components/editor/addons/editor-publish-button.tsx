"use client";

import { Button } from "@/components/ui/button";
import { useDocumentStorage } from "@/hooks/use-document-storage";
import { extractMetadata } from "@/lib/get-article-title";
import { uploadMetadata } from "@/lib/upload-utils";
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

export const PublishButton = ({ disabled }: { disabled?: boolean }) => {
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
      toast.error("Please connect your wallet and select a profile to publish");
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
    const { title, subtitle, coverImage } = extractMetadata(contentJson);

    // const publish = false;
    // if (!publish) {
    //   console.log(title, subtitle, coverImage);
    //   console.log(JSON.stringify(contentJson, null, 2));
    //   console.log(contentHtml);
    //   console.log(contentMarkdown);
    //   return;
    // }

    try {
      const metadata = article({
        title,
        content: contentMarkdown,
        locale: "en",
        appId: "fountain",
        attributes: [
          { key: "contentJson", type: MetadataAttributeType.JSON, value: JSON.stringify(contentJson) },
          { key: "contentHtml", type: MetadataAttributeType.STRING, value: contentHtml },
        ],
      });

      const metadataURI = await uploadMetadata(metadata, handle);
      const result = await execute({
        metadata: metadataURI,
      });

      if (result.isFailure()) {
        toast.error(`Failed to create post: ${result.error.message}`);
        return;
      }

      const post = await result.value.waitForCompletion();

      toast.success(`Post created successfully! ID: ${post.unwrap().id}`);
      router.refresh();

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
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("An error occurred while creating the post. See console for details");
    }
  };

  return <Button disabled={disabled} onClick={handlePublish}>Publish</Button>;
};
