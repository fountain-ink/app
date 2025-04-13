"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ExternalLink } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";

type BlogType = {
  address: string;
  owner: string;
  title: string | null;
  handle: string | null;
  slug: string | null;
  about: string | null;
  created_at: string;
  updated_at: string | null;
  icon: string | null;
  metadata: any;
  theme: any | null;
};

export default function BlogsLookupPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [blogs, setBlogs] = useState<BlogType[]>([]);

  const handleSearch = async () => {
    if (!searchQuery || searchQuery.length < 2) return;

    setLoading(true);
    setBlogs([]);
    
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .or(`title.ilike.%${searchQuery}%, handle.ilike.%${searchQuery}%, owner.ilike.%${searchQuery}%, address.ilike.%${searchQuery}%`)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Error searching blogs:", error);
      } else {
        setBlogs(data || []);
      }
    } catch (error) {
      console.error("Error searching for blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex space-x-2">
        <Input
          placeholder="Search by title, handle, owner, or address..."
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
              <TableHead>Handle</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {blogs.length > 0 ? (
              blogs.map((blog) => (
                <TableRow key={blog.address}>
                  <TableCell className="font-medium flex items-center gap-2">
                    {blog.title || "Untitled"}
                    {blog.handle && blog.slug && (
                      <a 
                        href={`/${blog.handle}/${blog.slug}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary inline-flex items-center"
                        title="View blog"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </TableCell>
                  <TableCell>
                    {blog.handle ? (
                      <Badge variant="outline">@{blog.handle}</Badge>
                    ) : (
                      <span className="text-muted-foreground">No handle</span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs truncate max-w-[150px]">
                    {blog.owner}
                  </TableCell>
                  <TableCell>{new Date(blog.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {blog.updated_at ? new Date(blog.updated_at).toLocaleDateString() : "N/A"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">View</Button>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  {searchQuery ? "No blogs found" : "Search for blogs to view them"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
} 