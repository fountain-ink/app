"use client";

import { LimitType, useSearchProfiles } from "@lens-protocol/react-web";
import { LoadingSpinner } from "../loading-spinner";
import { InlineComboboxEmpty, InlineComboboxItem } from "../ui/inline-combobox";

export type MentionableUser = {
  key: string;
  name: string;
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
      name: profile.metadata?.displayName || "",
      text: profile.handle?.localName || "",
      handle: profile.handle?.localName || "",
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
          <div className="flex justify-center items-center">
            <LoadingSpinner />
          </div>
        </InlineComboboxEmpty>
      ) : (
        mentionables?.map((user) => (
          <InlineComboboxItem key={user.handle} value={user.handle} onClick={() => onResultsChange?.([user])}>
            <div className="flex items-center min-w-48 max-w-96 w-full gap-2">
              {user.picture ? (
                <img src={user.picture} alt={user.handle} className="w-8 h-8 rounded-full" />
              ) : (
                <span className="w-8 h-8 bg-primary/40 rounded-full" />
              )}
              <span className="flex flex-col">
                <span className="font-semibold truncate text-ellipsis">{user.name}</span>
                <span className="text-muted-foreground">@{user.handle}</span>
              </span>
            </div>
          </InlineComboboxItem>
        ))
      )}
    </>
  );
}
