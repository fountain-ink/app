import { Database } from "../supabase/database";
import { isEvmAddress } from "../utils/is-evm-address";
import { createClient } from "../supabase/client";

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
};

export type BlogData = Omit<Blog, "theme" | "metadata"> & {
  theme: BlogThemeData;
  metadata: BlogMetadata;
};

/**
 * Finds a blog by identifier (either address or handle)
 * @param identifier The blog identifier - either an EVM address or a handle
 * @returns The blog data or null if not found
 */
async function findBlogByIdentifier(identifier: string) {
  const db = createClient();

  // Determine if the identifier is an EVM address or a handle
  if (isEvmAddress(identifier)) {
    // Query by address
    return await db.from("blogs").select("*").eq("address", identifier).single();
  } else {
    // Query by handle
    return await db.from("blogs").select("*").eq("handle", identifier).single();
  }
}

/**
 * Gets blog data by either an EVM address or a handle (username)
 * @param identifier The blog identifier - either an EVM address or a handle
 * @returns The blog data or null if not found
 */
export const getBlogData = async (identifier: string) => {
  try {
    const { data, error } = await findBlogByIdentifier(identifier);

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
      theme: blog?.theme as BlogThemeData,
      metadata: blog?.metadata as BlogMetadata,
    } as BlogData;
  } catch (error) {
    console.error("Error fetching blog data:", error);
    return null;
  }
};
