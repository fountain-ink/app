import { cookies } from "next/headers";
import { getTokenClaims } from "../auth/get-token-claims";
import { createClient } from "../supabase/server";

interface Settings {
  metadata: {
    blog?: {
      title?: string;
      about?: string;
      showAuthor?: boolean;
      showTags?: boolean;
      showTitle?: boolean;
      icon?: string;
    };
    app?: {
      isSmoothScrolling?: boolean;
      isBlurEnabled?: boolean;
    };
    theme?: {
      name?: string;
      customColor?: string;
      customBackground?: string;
    };
  };
  email?: string | null;
}

export async function getSettings(): Promise<Settings | null> {
  const cookieStore = cookies();
  const token = cookieStore.get("appToken")?.value;

  if (!token) {
    return null;
  }

  const claims = getTokenClaims(token);
  if (!claims?.user_metadata?.profileId) {
    return null;
  }

  const db = await createClient();
  const { data, error } = await db
    .from("users")
    .select("metadata, email")
    .eq("profileId", claims.user_metadata.profileId)
    .single();

  if (error) {
    console.error("Error fetching user settings:", error);
    return null;
  }

  if (!data) {
    return null;
  }

  return {
    metadata: data.metadata as Settings['metadata'],
    email: data.email
  };
}
