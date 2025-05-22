"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState, useEffect, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Database } from "@/lib/db/database";

type DraftType = Database["public"]["Tables"]["drafts"]["Row"];

export default function DraftsLookupPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [drafts, setDrafts] = useState<DraftType[]>([]);
  const [selectedDraft, setSelectedDraft] = useState<DraftType | null>(null);
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
      setDrafts([]);
      return;
    }

    const searchDrafts = async () => {
      setSearchLoading(true);
      setShowResults(true);

      try {
        const response = await fetch(`/api/admin/drafts?query=${encodeURIComponent(searchQuery)}`);
        const result = await response.json();

        if (response.ok && result.data) {
          setDrafts(result.data);
        } else {
          setDrafts([]);
          console.error("Error fetching drafts:", result.error);
        }
      } catch (error) {
        console.error("Error searching drafts:", error);
        setDrafts([]);
      } finally {
        setSearchLoading(false);
      }
    };

    const debounceTimeout = setTimeout(searchDrafts, 300);
    return () => clearTimeout(debounceTimeout);
  }, [searchQuery]);

  const submitSearch = async () => {
    if (!searchQuery || searchQuery.length < 2) return;

    if (drafts.length > 0) {
      const firstDraft = drafts[0];
      if (firstDraft) {
        await selectDraft(firstDraft);
        return;
      }
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/drafts?query=${encodeURIComponent(searchQuery)}`);
      const result = await response.json();

      if (response.ok && result.data && result.data.length > 0) {
        await selectDraft(result.data[0]);
      } else {
        console.log("No drafts found");
      }
    } catch (error) {
      console.error("Error submitting search:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle selecting a draft
  const selectDraft = async (draft: DraftType) => {
    setShowResults(false);
    setSelectedDraft(draft);
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <div className="flex space-x-2">
          <Input
            placeholder="Search by title, document ID, or author..."
            className="flex-1"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitSearch();
            }}
            onFocus={() => {
              if (drafts.length > 0) setShowResults(true);
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
              ) : drafts.length > 0 ? (
                <div className="space-y-1">
                  <div className="px-2 py-1 text-xs font-medium text-muted-foreground">Draft Results</div>
                  {drafts.map((draft) => (
                    <div
                      key={draft.id}
                      className="flex items-center gap-2 px-2 py-1 hover:bg-accent cursor-pointer rounded-sm"
                      onClick={() => selectDraft(draft)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex gap-2 items-baseline">
                          <span className="text-sm font-semibold truncate">{draft.title || "Untitled Draft"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground truncate">
                            {draft.author || "Unknown author"}
                          </span>
                          <span className="text-xs font-mono text-muted-foreground">ID: {draft.documentId}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchQuery.length >= 2 ? (
                <div className="p-4 text-center text-muted-foreground">No drafts found</div>
              ) : (
                <div className="p-4 text-center text-muted-foreground">Start typing to search</div>
              )}
            </div>
          </div>
        )}
      </div>

      {loading && !selectedDraft ? (
        <DraftSearchSkeleton />
      ) : selectedDraft ? (
        <DraftDetailView draft={selectedDraft} />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Document ID</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                Search for drafts to view them
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )}
    </div>
  );
}

function DraftSearchSkeleton() {
  return (
    <div className="space-y-6 p-4 border rounded-lg border-border">
      <div className="flex items-center space-x-4">
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

function DraftDetailView({ draft }: { draft: DraftType }) {
  return (
    <div className="space-y-6">
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-start gap-6">
            <div className="space-y-1 flex-1">
              <CardTitle className="text-xl">{draft.title || "Untitled Draft"}</CardTitle>
              {draft.author && <p className="text-muted-foreground">Author: {draft.author}</p>}
              <p className="text-sm font-mono text-muted-foreground">Document ID: {draft.documentId}</p>
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary">{new Date(draft.createdAt).toLocaleDateString()}</Badge>
                {draft.updatedAt && (
                  <Badge variant="outline">Updated: {new Date(draft.updatedAt).toLocaleDateString()}</Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Draft Content</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] w-full rounded-md border border-border">
            <div className="p-4">
              <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(draft.contentJson, null, 2)}</pre>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
