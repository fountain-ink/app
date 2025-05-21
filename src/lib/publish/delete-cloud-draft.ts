import { QueryClient } from "@tanstack/react-query";

export interface DeleteDraftArgs {
  documentId: string;
  queryClient: QueryClient;
}

export async function deleteCloudDraft({
  documentId,
  queryClient,
}: DeleteDraftArgs): Promise<void> {
  try {
    const res = await fetch(`/api/drafts?id=${documentId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      console.log("Deleted cloud draft after publication");
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