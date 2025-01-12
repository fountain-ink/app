"use client";

import { Button } from "@/components/ui/button";
import { useDocumentStorage } from "@/hooks/use-document-storage";
import { getLensClient } from "@/lib/lens/client";
import { storageClient } from "@/lib/lens/storage-client";
import { TransactionIndexingError, TxHash, UnexpectedError } from "@lens-protocol/client";
import { currentSession, post } from "@lens-protocol/client/actions";
import { MetadataAttributeType, article } from "@lens-protocol/metadata";
import { useSessionClient } from "@lens-protocol/react";
import { useQueryClient } from "@tanstack/react-query";
import { createPlateEditor, useEditorState } from "@udecode/plate-common/react";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { toast } from "sonner";
import { useAccount, useWalletClient } from "wagmi";
import { getElements } from "../elements";
import { staticPlugins } from "../plugins";

export const PublishButton = ({
  disabled,
  tags,
  title,
  subtitle,
  coverImage,
}: { disabled?: boolean; tags?: string[]; title?: string; subtitle?: string; coverImage?: string }) => {
  const { data: session } = useSessionClient();
  const { isConnected: isWalletConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
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
    if (!isWalletConnected || !walletClient) {
      toast.error("Please connect your wallet and log in to publish");
      return;
    }

    if (!editor) {
      toast.error("Editor not initialized");
      return;
    }

    const lens = await getLensClient();
    if (!lens.isSessionClient()) {
      toast.error("Please log in to publish");
      return;
    }

    const session = await currentSession(lens).unwrapOr(null);

    if (!session) {
      toast.error("Please log in to publish");
      return;
    }

    const handle = session.signer;

    const contentJson = editorState.children;
    const contentHtml = editor.api.htmlReact?.serialize({
      nodes: editorState.children,
      stripDataAttributes: true,
      preserveClassNames: [],
      stripWhitespace: true,
      dndWrapper: (props: any) => <DndProvider context={window} backend={HTML5Backend} {...props} />,
    });

    const contentMarkdown = editorState.api.markdown.serialize();

    try {
      const metadata = article({
        title,
        content: contentMarkdown,
        locale: "en",
        tags,
        attributes: [
          { key: "contentJson", type: MetadataAttributeType.JSON, value: JSON.stringify(contentJson) },
          { key: "contentHtml", type: MetadataAttributeType.STRING, value: contentHtml },
          { key: "subtitle", type: MetadataAttributeType.STRING, value: subtitle ?? "" },
        ],
      });

      const { uri } = await storageClient.uploadAsJson(metadata);
      const pendingToast = toast.loading("Publishing post...");

      // Create post and handle the transaction with viem wallet client
      const result = await post(lens, {
        contentUri: uri,
      });

      if (result.isErr()) {
        toast.dismiss(pendingToast);
        const error = result.error as UnexpectedError;
        toast.error(`Failed to create post: ${error.message}`);
        return;
      }

      // Handle different transaction scenarios
      const value = result.value;
      let txHash: TxHash;

      switch (value.__typename) {
        case "PostResponse":
          txHash = value.hash;
          break;

        case "SponsoredTransactionRequest":
        case "SelfFundedTransactionRequest": {
          toast.loading("Please approve the transaction...", { id: pendingToast });
          txHash = (await walletClient.sendTransaction({
            to: value.raw.to,
            data: value.raw.data,
            value: BigInt(value.raw.value),
            gas: BigInt(value.raw.gasLimit),
            maxFeePerGas: value.raw.maxFeePerGas ? BigInt(value.raw.maxFeePerGas) : undefined,
            maxPriorityFeePerGas: value.raw.maxPriorityFeePerGas ? BigInt(value.raw.maxPriorityFeePerGas) : undefined,
          })) as TxHash;
          break;
        }

        default:
          toast.dismiss(pendingToast);
          toast.error("Unexpected response type");
          return;
      }

      // Wait for transaction to be mined and indexed
      toast.loading("Waiting for transaction to be mined...", { id: pendingToast });

      const completion = await lens.waitForTransaction(txHash);

      if (completion.isErr()) {
        toast.dismiss(pendingToast);
        const error = completion.error;
        if (error instanceof TransactionIndexingError) {
          switch (error.name) {
            case "TransactionIndexingError":
              toast.error("Transaction indexing failed");
              break;
            default:
              toast.error("Unknown error occurred while processing transaction");
          }
        } else {
          toast.error("Unexpected error occurred while processing transaction");
        }
        return;
      }

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
      router.push(`/u/${handle}`);
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
