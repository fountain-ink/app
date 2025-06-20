"use client";

import { fetchAccounts } from "@lens-protocol/client/actions";
import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Database } from "@/lib/db/database";
import { getLensClient } from "@/lib/lens/client";
import { resolveUrl } from "@/lib/utils/resolve-url";

// Type for Lens account data
type LensAccountData = {
  address: string;
  username?: string;
  name?: string | null;
  picture?: string;
  metadata?: any;
};

// Type for DB user data - using the database definition
type DbUserData = Database["public"]["Tables"]["users"]["Row"] | null;

// Combined user data
type UserData = {
  lensData: LensAccountData;
  dbData: DbUserData;
};

export default function UsersLookupPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [lensAccounts, setLensAccounts] = useState<LensAccountData[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showResults, setShowResults] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setLensAccounts([]);
      return;
    }

    const searchAccounts = async () => {
      setSearchLoading(true);
      setShowResults(true);

      try {
        const lens = await getLensClient();
        const isEthereumAddress = searchQuery.startsWith("0x");

        let accounts;
        if (isEthereumAddress) {
          // Search by address - for addresses, use a generic search approach
          accounts = await fetchAccounts(lens, {
            filter: {
              searchBy: {
                localNameQuery: searchQuery, // Search will still find by address
              },
            },
          }).unwrapOr(null);
        } else {
          accounts = await fetchAccounts(lens, {
            filter: {
              searchBy: {
                localNameQuery: searchQuery,
              },
            },
          }).unwrapOr(null);
        }

        if (accounts?.items) {
          const results = accounts.items.map((item) => ({
            address: item.address,
            username: item.username?.localName,
            name: item.metadata?.name,
            picture: item.metadata?.picture ? resolveUrl(item.metadata.picture) : undefined,
            metadata: item.metadata,
          })) as LensAccountData[];

          setLensAccounts(results);
        } else {
          setLensAccounts([]);
        }
      } catch (error) {
        console.error("Error searching Lens accounts:", error);
        setLensAccounts([]);
      } finally {
        setSearchLoading(false);
      }
    };

    const debounceTimeout = setTimeout(searchAccounts, 300);
    return () => clearTimeout(debounceTimeout);
  }, [searchQuery]);

  const submitSearch = async () => {
    if (!searchQuery || searchQuery.length < 2) return;

    if (lensAccounts.length > 0) {
      const firstAccount = lensAccounts[0] as LensAccountData;
      await selectLensAccount(firstAccount);
      return;
    }

    setLoading(true);
    try {
      const lens = await getLensClient();
      const isEthereumAddress = searchQuery.startsWith("0x");

      let accounts;
      if (isEthereumAddress) {
        accounts = await fetchAccounts(lens, {
          filter: {
            searchBy: {
              localNameQuery: searchQuery,
            },
          },
        }).unwrapOr(null);
      } else {
        accounts = await fetchAccounts(lens, {
          filter: {
            searchBy: {
              localNameQuery: searchQuery,
            },
          },
        }).unwrapOr(null);
      }

      if (accounts?.items?.[0]) {
        const item = accounts.items[0];

        // Create a safe account object with null checks
        const account: LensAccountData = {
          address: item.address || "",
          username: item.username?.localName,
          name: item.metadata?.name,
          picture: item.metadata?.picture ? resolveUrl(item.metadata.picture) : undefined,
          metadata: item.metadata || {},
        };

        await selectLensAccount(account);
      } else {
        console.log("No accounts found");
      }
    } catch (error) {
      console.error("Error submitting search:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle selecting a lens account
  const selectLensAccount = async (account: LensAccountData) => {
    setShowResults(false);
    setLoading(true);

    try {
      // First try to look up by address
      let response = await fetch(`/api/admin/users?address=${account.address}`);
      let result = await response.json();

      // If no results and we have a username, try looking up by handle
      if (!result.data && account.username) {
        // Try to find user by handle
        console.log(`No results by address, trying handle: ${account.username}`);
        response = await fetch(`/api/admin/users?handle=${account.username}`);
        result = await response.json();
      }

      // Log the response for debugging
      console.log("DB lookup response:", result);

      // Set the selected user data
      setSelectedUser({
        lensData: account,
        dbData: response.ok && result.data ? result.data : null,
      });
    } catch (error) {
      console.error("Error looking up account in database:", error);
      setSelectedUser({
        lensData: account,
        dbData: null,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <div className="flex space-x-2">
          <Input
            placeholder="Search by username or address..."
            className="flex-1"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitSearch();
            }}
            onFocus={() => {
              if (lensAccounts.length > 0) setShowResults(true);
            }}
          />
          <Button onClick={submitSearch} disabled={loading}>
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>

        {showResults && (
          <div
            ref={resultsRef}
            className="absolute z-10 w-full mt-1 border border-border rounded-md bg-background shadow-md overflow-hidden"
          >
            <div className="max-h-64 overflow-auto p-1">
              {searchLoading ? (
                <div className="flex justify-center items-center p-4">
                  <div className="animate-spin w-5 h-5 border-2 border-border border-t-transparent rounded-full" />
                </div>
              ) : lensAccounts.length > 0 ? (
                <div className="space-y-1">
                  <div className="px-2 py-1 text-xs font-medium text-muted-foreground">Lens Protocol Results</div>
                  {lensAccounts.map((account) => (
                    <div
                      key={account.address}
                      className="flex items-center gap-2 px-2 py-1 hover:bg-accent cursor-pointer rounded-sm"
                      onClick={() => selectLensAccount(account)}
                    >
                      {account.picture ? (
                        <img
                          src={account.picture}
                          alt={account.username || account.name || ""}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{account.name ? account.name.charAt(0).toUpperCase() : "?"}</AvatarFallback>
                        </Avatar>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex gap-2 items-baseline">
                          <span className="text-sm font-semibold truncate">{account.name || "Unknown"}</span>
                          {account.username && (
                            <span className="text-xs text-muted-foreground truncate">@{account.username}</span>
                          )}
                        </div>
                        <span className="text-xs font-mono text-muted-foreground truncate">
                          {account.address.substring(0, 6)}...{account.address.substring(account.address.length - 4)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchQuery.length >= 2 ? (
                <div className="p-4 text-center text-muted-foreground">No accounts found</div>
              ) : (
                <div className="p-4 text-center text-muted-foreground">Start typing to search</div>
              )}
            </div>
          </div>
        )}
      </div>

      {loading && !selectedUser ? (
        <UserSearchSkeleton />
      ) : selectedUser ? (
        <UserDetailView userData={selectedUser} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>User Lookup</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground py-8">
              Search for a Lens Protocol account by username or address
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function UserSearchSkeleton() {
  return (
    <div className="space-y-6 p-4 border rounded-lg border-border">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

function UserDetailView({ userData }: { userData: UserData }) {
  const { lensData, dbData } = userData;

  const initials = lensData.name
    ? lensData.name
        .split(" ")
        .map((part) => part.charAt(0))
        .join("")
        .toUpperCase()
    : "??";

  return (
    <div className="space-y-6">
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-start gap-6">
            <Avatar className="h-16 w-16">
              {lensData.picture ? <AvatarImage src={lensData.picture} alt={lensData.name || "User"} /> : null}
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>

            <div className="space-y-1 flex-1">
              <CardTitle className="text-xl">{lensData.name || "Unknown User"}</CardTitle>
              {lensData.username && <p className="text-muted-foreground">@{lensData.username}</p>}
              <p className="text-sm font-mono text-muted-foreground truncate">{lensData.address}</p>
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary">Lens Protocol</Badge>
                {dbData ? (
                  <Badge variant="default">Internal DB</Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">
                    Not in Database
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="space-y-6">
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Lens Protocol Data</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1 border-border border rounded-md p-3">
              <p className="text-sm font-medium text-muted-foreground">Address</p>
              <p className="text-sm font-mono">{lensData.address}</p>
            </div>

            {lensData.username && (
              <div className="space-y-1 border-border border rounded-md p-3">
                <p className="text-sm font-medium text-muted-foreground">Username</p>
                <p>@{lensData.username}</p>
              </div>
            )}

            {lensData.name && (
              <div className="space-y-1 border-border border rounded-md p-3">
                <p className="text-sm font-medium text-muted-foreground">Display Name</p>
                <p>{lensData.name}</p>
              </div>
            )}

            {lensData.metadata && Object.keys(lensData.metadata).length > 0 && (
              <div className="col-span-full space-y-1 border-border border rounded-md p-3">
                <p className="text-sm font-medium text-muted-foreground">Metadata</p>
                <ScrollArea className="h-60 w-full rounded-md border border-border bg-muted">
                  <div className="text-sm font-mono">
                    <pre className="text-xs border border-border rounded-md p-2">
                      {JSON.stringify(lensData.metadata, null, 2)}
                    </pre>
                  </div>
                </ScrollArea>
              </div>
            )}
          </CardContent>
        </Card>

        {dbData ? (
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Internal Database Data</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1 border-border border rounded-md p-3">
                <p className="text-sm font-medium text-muted-foreground">Address</p>
                <p className="text-sm font-mono">{dbData.address}</p>
              </div>

              {dbData.handle && (
                <div className="space-y-1 border-border border rounded-md p-3">
                  <p className="text-sm font-medium text-muted-foreground">Handle</p>
                  <p>@{dbData.handle}</p>
                </div>
              )}

              {dbData.name && (
                <div className="space-y-1 border-border border rounded-md p-3">
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p>{dbData.name}</p>
                </div>
              )}

              {dbData.email && (
                <div className="space-y-1 border-border border rounded-md p-3">
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p>{dbData.email}</p>
                </div>
              )}

              <div className="space-y-1 border-border border rounded-md p-3">
                <p className="text-sm font-medium text-muted-foreground">Anonymous</p>
                <p>{dbData.isAnonymous ? "Yes" : "No"}</p>
              </div>

              <div className="space-y-1 border-border border rounded-md p-3">
                <p className="text-sm font-medium text-muted-foreground">Created At</p>
                <p>{new Date(dbData.createdAt).toLocaleString()}</p>
              </div>

              <div className="space-y-1 border-border border rounded-md p-3">
                <p className="text-sm font-medium text-muted-foreground">Updated At</p>
                <p>{new Date(dbData.updatedAt).toLocaleString()}</p>
              </div>

              {dbData.owner && (
                <div className="space-y-1 border-border border rounded-md p-3">
                  <p className="text-sm font-medium text-muted-foreground">Owner</p>
                  <p className="text-sm font-mono">{dbData.owner}</p>
                </div>
              )}

              {dbData.metadata && (
                <div className="col-span-full space-y-1 border-border border rounded-md p-3">
                  <p className="text-sm font-medium text-muted-foreground">Metadata</p>
                  <ScrollArea className="h-60 w-full rounded-md border border-border bg-muted">
                    <div className="text-sm font-mono">
                      <pre className="text-xs border border-border rounded-md p-2">
                        {JSON.stringify(dbData.metadata, null, 2)}
                      </pre>
                    </div>
                  </ScrollArea>
                </div>
              )}

              {dbData.settings && (
                <div className="col-span-full space-y-1 border-border border rounded-md p-3">
                  <p className="text-sm font-medium text-muted-foreground">Settings</p>
                  <ScrollArea className="h-60 w-full rounded-md border border-border bg-muted">
                    <div className="text-sm font-mono">
                      <pre className="text-xs border border-border rounded-md p-2">
                        {JSON.stringify(dbData.settings, null, 2)}
                      </pre>
                    </div>
                  </ScrollArea>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Internal Database Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                This Lens account does not exist in the database
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
