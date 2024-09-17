"use client";

import type { ProfileFragment } from "@lens-protocol/client";
import type { Profile } from "@lens-protocol/react-web";
import { TruncatedText } from "../content/truncated-text";

export const UserBio = ({ profile }: { profile?: ProfileFragment | Profile }) => {
  if (!profile) {
    return null;
  }

  const content = profile?.metadata?.bio || "";

  return (
    <div className="text-foreground">
      <TruncatedText text={content} maxLength={200} isMarkdown={true} />
    </div>
  );
};
