import { toast } from "sonner";

export type SharePlatform = "x" | "bluesky" | "lens" | "copy";

const extractPublicationId = (url: string): string | null => {
  const matches = url.match(/\/u\/[^/]+\/([^/?]+)/);
  return matches?.[1] ?? null;
};

export const getShareUrl = (platform: SharePlatform, url: string, text?: string) => {
  switch (platform) {
    case "x":
      return `https://x.com/intent/tweet?${text ? `text=${encodeURIComponent(text)}&` : ""}url=${encodeURIComponent(url)}`;
    case "bluesky":
      return `https://bsky.app/intent/compose?text=${encodeURIComponent(text ? `${text}\n\n${url}` : url)}`;
    case "lens": {
      const publicationId = extractPublicationId(url);
      if (!publicationId) return url;

      return `https://share.lens.xyz/p/${publicationId}`;
    }
    default:
      return url;
  }
};

export const handlePlatformShare = (platform: SharePlatform) => {
  const cleanUrl = window.location.href.split("?")[0] ?? window.location.href;

  if (platform === "copy") {
    navigator.clipboard.writeText(cleanUrl);
    toast.success("Copied URL to clipboard!");
    return;
  }

  const shareUrl = getShareUrl(platform, cleanUrl, "Check this out:");
  window.open(shareUrl, "_blank", "noopener,noreferrer");
};
