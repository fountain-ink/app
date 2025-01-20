export interface UserMetadata {
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
}

export interface PrivateUserData {
  email: string | null;
} 