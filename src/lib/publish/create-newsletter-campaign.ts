import type { Draft } from "@/components/draft/draft";
import { createClient } from "@/lib/db/client";
import { createCampaignForPost } from "@/lib/listmonk/newsletter";

interface CreateNewsletterCampaignParams {
  selectedBlogAddress?: string;
  postSlug: string;
  username: string;
  draft: Draft;
}

export async function createNewsletterCampaign({
  selectedBlogAddress,
  postSlug,
  username,
  draft,
}: CreateNewsletterCampaignParams): Promise<void> {
  if (!selectedBlogAddress) {
    return;
  }

  const db = createClient();
  const { data: blog } = await db.from("blogs").select("*").eq("address", selectedBlogAddress).single();

  if (blog?.mail_list_id) {
    try {
      const newsletterPostData = {
        title: draft.title || "",
        subtitle: draft.subtitle || "",
        content: draft.contentMarkdown || "",
        coverUrl: draft.coverUrl || "",
        username,
      };

      try {
        const result = await createCampaignForPost(selectedBlogAddress, postSlug, newsletterPostData);
        if (result?.success) {
          console.log("Created campaign for mailing list subscribers");
        } else {
          console.error("Failed to create campaign for mailing list");
        }
      } catch (error) {
        console.error("Error creating campaign for mailing list:", error);
      }
    } catch (error) {
      console.error("Error fetching blog data:", error);
    }
  }
}
