import { getBaseUrl } from "../get-base-url";

/**
 * Fetches the lens post ID associated with a custom slug for a specific user
 * @param slug The custom slug
 * @param handle The username/handle
 * @returns The lens post ID if found, or null if not found
 */
export async function getPostIdBySlug(slug: string, handle: string): Promise<string | null> {
  try {
    const response = await fetch(
      `${getBaseUrl()}/api/posts/slug/lookup?slug=${encodeURIComponent(slug)}&handle=${encodeURIComponent(handle)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      console.error("Error fetching post by slug:", await response.text());
      return null;
    }

    const data = await response.json();

    if (data.found && data.lens_slug) {
      return data.lens_slug;
    }

    return null;
  } catch (error) {
    console.error("Failed to fetch post by slug:", error);
    return null;
  }
}
