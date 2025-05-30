import { Database } from "../db/database";
import { createClient } from "../db/server";

type Blog = Database["public"]["Tables"]["blogs"]["Row"];

export type BlogThemeData = {
  name?: string;
  customColor?: string;
  customBackground?: string;
  customCss?: string;
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

export const getBlogsByOwner = async (ownerAddress: string) => {
  try {
    const db = await createClient();
    const { data, error } = await db.from("blogs").select("*").eq("owner", ownerAddress);

    if (error) {
      console.error("Error fetching blogs by owner:", error);
      return [];
    }

    return (data || []).map((blog) => ({
      ...blog,
      theme: blog?.theme as BlogThemeData,
      metadata: blog?.metadata as BlogMetadata,
    })) as BlogData[];
  } catch (error) {
    console.error("Error fetching blogs by owner:", error);
    return [];
  }
};
