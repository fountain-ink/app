"use client";

import { getLensClient } from "@/lib/lens/client";
import { fetchAccounts } from "@lens-protocol/client/actions";
import { useEffect, useState } from "react";
import { LoadingSpinner } from "../misc/loading-spinner";
import { InlineComboboxEmpty, InlineComboboxItem } from "../ui/inline-combobox";

export type MentionableUser = {
  key: string;
  name: string;
  text: string;
  username: string;
  picture?: string;
};

export function UserSearch({
  query,
  maxResults = 10,
  onResultsChange,
}: {
  query: string;
  maxResults?: number;
  onResultsChange?: (results: MentionableUser[]) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [profiles, setProfiles] = useState<MentionableUser[]>([]);

  useEffect(() => {
    async function searchProfiles() {
      if (!query) {
        setProfiles([]);
        return;
      }

      setLoading(true);
      try {
        const lens = await getLensClient();
        const account = await fetchAccounts(lens, { filter: { searchBy: { localNameQuery: query } } }).unwrapOr(null);
        const items = account?.items || [];

        if (items.length > 0) {
          const mentionables = items.slice(0, maxResults).map(item => ({
            key: item.address,
            name: item.metadata?.name || "",
            text: item.username?.localName || "",
            username: item.username?.localName || "",
            picture: item.metadata?.picture
          }));
          setProfiles(mentionables);
        } else {
          setProfiles([]);
        }
      } catch (error) {
        console.error("Error fetching profiles:", error);
        setProfiles([]);
      } finally {
        setLoading(false);
      }
    }

    const debounceTimeout = setTimeout(searchProfiles, 300);
    return () => clearTimeout(debounceTimeout);
  }, [query, onResultsChange]);

  if (!query) {
    return null;
  }

  return (
    <>
      {loading ? (
        <InlineComboboxEmpty>
          <div className="flex justify-center items-center">
            <LoadingSpinner />
          </div>
        </InlineComboboxEmpty>
      ) : (
        profiles.map((user) => (
          <InlineComboboxItem key={user.username} value={user.username} onClick={() => onResultsChange?.([user])}>
            <div className="flex items-center min-w-48 max-w-96 w-full gap-2">
              {user.picture ? (
                <img src={user.picture} alt={user.username} className="w-8 h-8 rounded-full" />
              ) : (
                <span className="w-8 h-8 bg-primary/40 rounded-full" />
              )}
              <span className="flex flex-col">
                <span className="font-semibold truncate text-ellipsis">{user.name}</span>
                <span className="text-muted-foreground">@{user.username}</span>
              </span>
            </div>
          </InlineComboboxItem>
        ))
      )}
    </>
  );
}
