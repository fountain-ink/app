import { Database } from "../supabase/database";
import { createClient } from "../supabase/server";

export type BlogData = Database["public"]["Tables"]["blogs"]["Row"];

type ThemeData =  {
  name?: string;
  customColor?: string;
  customBackground?: string;
}

type Metadata = {
  showAuthor?: boolean;
  showTags?: boolean;
  showTitle?: boolean;
}


export const getBlogData = async (address: string) => {
  try {
    const db = await createClient();
    const { data, error } = await db.from("blogs").select("*").eq("address", address).single();

    if (error) {
      console.error("Error fetching user metadata:", error);
      return null;
    }

    const blog = data as BlogData;

    return {
      ...blog,
      theme: blog?.theme as ThemeData,
      metadata: blog?.metadata as Metadata,
    };

  } catch (error) {
    console.error("Error fetching user metadata:", error);
    return null;
  }
}
