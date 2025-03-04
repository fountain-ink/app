import { Database } from "../supabase/database";
import { createClient } from "../supabase/server";

type Blog = Database["public"]["Tables"]["blogs"]["Row"];

export type BlogThemeData =  {
  name?: string;
  customColor?: string;
  customBackground?: string;
}

export type BlogMetadata = {
  showAuthor?: boolean;
  showTags?: boolean;
  showTitle?: boolean;
}

export type BlogData = Omit<Blog, 'theme' | 'metadata'> & {
  theme: BlogThemeData;
  metadata: BlogMetadata;
}

export const getBlogData = async (address: string) => {
  try {
    const db = await createClient();
    const { data, error } = await db.from("blogs").select("*").eq("address", address).single();

    if (error) {
      console.error("Error fetching user metadata:", error);
      return null;
    }

    const blog = data as Blog;

    return {
      ...blog,
      theme: blog?.theme as BlogThemeData,
      metadata: blog?.metadata as BlogMetadata,
    } as BlogData;

  } catch (error) {
    console.error("Error fetching user metadata:", error);
    return null;
  }
}
