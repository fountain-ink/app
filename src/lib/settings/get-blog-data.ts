import { Database } from "../db/database";
import { isEvmAddress } from "../utils/is-evm-address";
import { createClient } from "../db/client";

type Blog = Database["public"]["Tables"]["blogs"]["Row"];

export type BlogThemeData = {
  name?: string;
  customColor?: string;
  customBackground?: string;
};

export type BlogMetadata = {
  showAuthor?: boolean;
  showTags?: boolean;
  showTitle?: boolean;
  newsletterEnabled?: boolean;
  emailContentType?: string;
};

export type BlogData = Omit<Blog, "theme" | "metadata"> & {
  theme: BlogThemeData | null;
  metadata: BlogMetadata | null;
};

/**
 * Finds a blog by identifier (either address or handle)
 * @param identifier The blog identifier - either an EVM address or a handle
 * @returns The blog data or null if not found
 */
async function findBlogByIdentifier(identifier: string, slug?: string) {
  const db = createClient();

  if (isEvmAddress(identifier)) {
    return await db.from("blogs").select("*").eq("address", identifier).single();
  }
  if (slug) {
    return await db.from("blogs").select("*").eq("handle", identifier).eq("slug", slug).single();
  }
  return await db.from("blogs").select("*").eq("handle", identifier).or('slug.is.null,slug.eq.""').single();
}

/**
 * Gets blog data by either an EVM address or a handle (username)
 * @param identifier The blog identifier - either an EVM address or a handle
 * @returns The blog data or null if not found
 */
export const getBlogData = async (identifier: string, slug?: string) => {
  try {
    const { data, error } = await findBlogByIdentifier(identifier, slug);

    if (error) {
      console.error("Error fetching blog data:", error);
      return null;
    }

    if (!data) {
      return null;
    }

    const blog = data as Blog;

    return {
      ...blog,
      theme: blog?.theme as BlogThemeData | null,
      metadata: blog?.metadata as BlogMetadata | null,
    } as BlogData;
  } catch (error) {
    console.error("Error fetching blog data:", error);
    return null;
  }
};
