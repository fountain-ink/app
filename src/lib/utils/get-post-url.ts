import type { Post } from "@lens-protocol/client";

export function getPostUrl(post: Post): string {
  const username = post.author.username?.localName || "";

  let customSlug: string | undefined;
  if ("attributes" in post.metadata && post.metadata.attributes) {
    customSlug = post.metadata.attributes.find((attr) => "key" in attr && attr.key === "slug")?.value;
  }

  const slug = customSlug || post.slug;

  return `/p/${username}/${slug}`;
}
