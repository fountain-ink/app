"use client";

import { LimitType, useSearchProfiles } from "@lens-protocol/react-web";
import { LoadingSpinner } from "../loading-spinner";
import { InlineComboboxEmpty, InlineComboboxItem } from "../ui/inline-combobox";

export type MentionableUser = {
  key: string;
  text: string;
  handle: string;
  picture?: string;
};

export function HandleSearch({
  query,
  maxResults = 10,
  onResultsChange,
}: {
  query: string;
  maxResults?: number;
  onResultsChange?: (results: MentionableUser[]) => void;
}) {
  const { data: profiles, loading, error } = useSearchProfiles({ query, limit: LimitType.Ten });

  if (error && query) throw error;

  if (!query) {
    return null;
  }

  const mentionables: MentionableUser[] | undefined = profiles
    ?.map((profile) => ({
      key: profile.id,
      text: profile.handle?.localName || "",
      handle: profile.handle?.fullHandle || "",
      picture:
        profile.metadata?.picture?.__typename === "ImageSet"
          ? profile.metadata?.picture?.optimized?.uri
          : profile.metadata?.picture?.image.optimized?.uri,
    }))
    .slice(0, maxResults);

  return (
    <>
      {loading ? (
        <InlineComboboxEmpty>
          <div className="p-2 flex justify-center items-center">
            <LoadingSpinner />
          </div>
        </InlineComboboxEmpty>
      ) : (
        mentionables?.map((user) => (
          <InlineComboboxItem key={user.key} value={user.text} onClick={() => onResultsChange?.(mentionables)}>
            <div className="flex items-center gap-2">
              {user.picture && <img src={user.picture} alt={user.handle} className="w-6 h-6 rounded-full" />}
              <span>{user.text}</span>
            </div>
          </InlineComboboxItem>
        ))
      )}
    </>
  );
}
