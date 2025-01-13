"use client";

import { Account } from "@lens-protocol/client";
import { TruncatedText } from "../misc/truncated-text";

export const UserBio = ({ profile }: { profile?: Account }) => {
  if (!profile) {
    return null;
  }

  const content = profile?.metadata?.bio || "";

  return (
    <div className="">
      <TruncatedText text={content} maxLength={200} isMarkdown={true} />
    </div>
  );
};
