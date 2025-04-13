"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";

export default function DraftsLookupPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [drafts, setDrafts] = useState<any[]>([]);

  const handleSearch = async () => {
    if (!searchQuery || searchQuery.length < 2) return;

    setLoading(true);
    setDrafts([]);
    
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('drafts')
        .select('*')
        .or(`title.ilike.%${searchQuery}%, documentId.eq.${searchQuery}, author.ilike.%${searchQuery}%`)
        .order('updatedAt', { ascending: false });
        
      if (error) {
        console.error("Error searching drafts:", error);
      } else {
        setDrafts(data || []);
      }
    } catch (error) {
      console.error("Error searching for drafts:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex space-x-2">
        <Input
          placeholder="Search by title, document ID, or author..."
          className="flex-1"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearch();
          }}
        />
        <Button onClick={handleSearch} disabled={loading}>
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
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
            {drafts.length > 0 ? (
              drafts.map((draft) => (
                <TableRow key={draft.id}>
                  <TableCell className="font-medium">{draft.title}</TableCell>
                  <TableCell>{draft.author || "Unknown"}</TableCell>
                  <TableCell className="font-mono text-xs">{draft.documentId}</TableCell>
                  <TableCell>{new Date(draft.createdAt).toLocaleString()}</TableCell>
                  <TableCell>
                    {draft.updatedAt ? new Date(draft.updatedAt).toLocaleString() : "N/A"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">View</Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  {searchQuery ? "No drafts found" : "Search for drafts to view them"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
} 