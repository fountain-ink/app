import { Database } from "../supabase/database";

export interface UserMetadata {
  blog?: {
    title?: string;
    about?: string;
    showAuthor?: boolean;
    showTags?: boolean;
    showTitle?: boolean;
    icon?: string;
  };
  theme?: {
    name?: string;
    customColor?: string;
    customBackground?: string;
  };
  app?: {
    isSmoothScrolling?: boolean;
    isBlurEnabled?: boolean;
  };
}

export type UserSettings = {
  metadata: UserMetadata;
}; 