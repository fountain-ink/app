import { toast } from "sonner";

import { fetchGroup } from "@lens-protocol/client/actions";
import { SessionClient } from "@lens-protocol/client";

export async function getFeedAddress(lens: SessionClient, selectedBlog: string | undefined) {
  if (!selectedBlog) {
    return undefined;
  }

  const blog = await fetchGroup(lens, {
    group: selectedBlog,
  });

  if (blog.isErr()) {
    toast.error("Failed to fetch blog data");
    return undefined;
  }

  return blog.value?.feed?.address ?? undefined;
}