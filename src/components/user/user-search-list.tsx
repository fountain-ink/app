import { useState, useEffect } from "react";
import { MentionableUser } from "./user-search";
import { getLensClient } from "@/lib/lens/client";
import { fetchAccounts } from "@lens-protocol/client/actions";

export function UserSearchList({
  query,
  onSelect,
}: {
  query: string;
  onSelect: (user: MentionableUser) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [profiles, setProfiles] = useState<MentionableUser[]>([]);

  useEffect(() => {
    async function searchProfiles() {
      if (!query || query.length < 1) {
        setProfiles([]);
        return;
      }

      setLoading(true);
      try {
        const lens = await getLensClient();
        const account = await fetchAccounts(lens, { filter: { searchBy: { localNameQuery: query } } }).unwrapOr(null);
        const items = account?.items || [];

        if (items.length > 0) {
          const mentionables = items.slice(0, 10).map((item: any) => ({
            key: item.address,
            name: item.metadata?.name || "",
            text: item.username?.localName || "",
            username: item.username?.localName || "",
            picture: item.metadata?.picture,
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
  }, [query]);

  if (!query || query.length < 1) {
    return <div className="p-2 text-center text-muted-foreground">Start typing to search</div>;
  }

  return (
    <div className="max-h-64 overflow-auto p-1">
      {loading ? (
        <div className="flex justify-center items-center p-4">
          <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : profiles.length === 0 ? (
        <div className="p-2 text-center text-muted-foreground">No users found</div>
      ) : (
        <div className="space-y-1">
          {profiles.map((user) => (
            <div
              key={user.key}
              className="flex items-center gap-2 px-2 py-1 hover:bg-accent cursor-pointer rounded-sm"
              onClick={() => onSelect(user)}
            >
              {user.picture ? (
                <img src={user.picture} alt={user.username} className="w-8 h-8 rounded-full" />
              ) : (
                <div className="w-8 h-8 bg-primary/40 rounded-full" />
              )}
              <div className="flex flex-col">
                <span className="text-sm font-semibold">{user.name}</span>
                <span className="text-sm text-muted-foreground">@{user.username}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}