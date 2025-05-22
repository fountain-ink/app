import { Draft } from "@/components/draft/draft";
import { getBaseUrl } from "../get-base-url";

/**
 * Generates the post content based on display preferences
 * @param draft The draft object containing content and metadata
 * @param username The user's username
 * @returns Markdown content formatted according to the lensDisplay setting
 */
export function getPostContent(draft: Draft, username: string): string {
  const { title, slug, contentMarkdown, distributionSettings } = draft;
  const lensDisplay = distributionSettings?.lensDisplay || "content_only";
  // const baseUrl = getBaseUrl();
  const baseUrl = "https://fountain.ink/";

  const postUrl = `${baseUrl}p/${username}/${slug}`;

  switch (lensDisplay) {
    case "link":
      return `${postUrl}`;

    case "title_link":
      return `${title} - ${postUrl}`;

    case "content_link":
      return `*Posted on Fountain - ${postUrl}*\n\n${contentMarkdown || ""}`;
    default:
      return contentMarkdown || "";
  }
}
