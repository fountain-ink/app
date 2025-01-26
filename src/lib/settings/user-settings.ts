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
}

export interface UserSettings {
  app?: {
    isSmoothScrolling?: boolean;
    isBlurEnabled?: boolean;
  };
}
