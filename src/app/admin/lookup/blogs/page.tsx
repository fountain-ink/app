"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ExternalLink } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState, useEffect, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const [searchLoading, setSearchLoading] = useState(false);
  const [blogs, setBlogs] = useState<BlogType[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<BlogType | null>(null);
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
      setBlogs([]);
      return;
    }

    const searchBlogs = async () => {
      setSearchLoading(true);
      setShowResults(true);

      try {
        const response = await fetch(`/api/admin/blogs?query=${encodeURIComponent(searchQuery)}`);
        const result = await response.json();

        if (response.ok && result.data) {
          setBlogs(result.data);
        } else {
          setBlogs([]);
          console.error("Error fetching blogs:", result.error);
        }
      } catch (error) {
        console.error("Error searching blogs:", error);
        setBlogs([]);
      } finally {
        setSearchLoading(false);
      }
    };

    const debounceTimeout = setTimeout(searchBlogs, 300);
    return () => clearTimeout(debounceTimeout);
  }, [searchQuery]);

  const submitSearch = async () => {
    if (!searchQuery || searchQuery.length < 2) return;

    if (blogs.length > 0) {
      const firstBlog = blogs[0];
      if (firstBlog) {
        await selectBlog(firstBlog);
        return;
      }
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/blogs?query=${encodeURIComponent(searchQuery)}`);
      const result = await response.json();

      if (response.ok && result.data && result.data.length > 0) {
        await selectBlog(result.data[0]);
      } else {
        console.log("No blogs found");
      }
    } catch (error) {
      console.error("Error submitting search:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectBlog = async (blog: BlogType) => {
    setShowResults(false);
    setSelectedBlog(blog);
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <div className="flex space-x-2">
          <Input
            placeholder="Search by title, handle, owner, or address..."
            className="flex-1"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitSearch();
            }}
            onFocus={() => {
              if (blogs.length > 0) setShowResults(true);
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
              ) : blogs.length > 0 ? (
                <div className="space-y-1">
                  <div className="px-2 py-1 text-xs font-medium text-muted-foreground">Blog Results</div>
                  {blogs.map((blog) => (
                    <div
                      key={blog.address}
                      className="flex items-center gap-2 px-2 py-1 hover:bg-accent cursor-pointer rounded-sm"
                      onClick={() => selectBlog(blog)}
                    >
                      {blog.icon && <img src={blog.icon} alt={blog.title || ""} className="w-6 h-6 rounded-full" />}
                      <div className="flex-1 min-w-0">
                        <div className="flex gap-2 items-baseline">
                          <span className="text-sm font-semibold truncate">{blog.title || "Untitled Blog"}</span>
                          {blog.handle && (
                            <span className="text-xs text-muted-foreground truncate">@{blog.handle}</span>
                          )}
                        </div>
                        <span className="text-xs font-mono text-muted-foreground truncate">
                          {blog.address.substring(0, 6)}...{blog.address.substring(blog.address.length - 4)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchQuery.length >= 2 ? (
                <div className="p-4 text-center text-muted-foreground">No blogs found</div>
              ) : (
                <div className="p-4 text-center text-muted-foreground">Start typing to search</div>
              )}
            </div>
          </div>
        )}
      </div>

      {loading && !selectedBlog ? (
        <BlogSearchSkeleton />
      ) : selectedBlog ? (
        <BlogDetailView blog={selectedBlog} />
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
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                Search for blogs to view them
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )}
    </div>
  );
}

function BlogSearchSkeleton() {
  return (
    <div className="space-y-6 p-4 border rounded-lg border-border">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-8 w-8 rounded-full" />
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

function BlogDetailView({ blog }: { blog: BlogType }) {
  return (
    <div className="space-y-6">
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-start gap-6">
            {blog.icon && (
              <img src={blog.icon} alt={blog.title || "Blog"} className="h-16 w-16 rounded-full object-cover" />
            )}
            <div className="space-y-1 flex-1">
              <CardTitle className="text-xl">
                {blog.title || "Untitled Blog"}
                {blog.handle && blog.slug && (
                  <a
                    href={`/${blog.handle}/${blog.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary inline-flex items-center ml-2"
                    title="View blog"
                  >
                    <ExternalLink size={16} />
                  </a>
                )}
              </CardTitle>
              {blog.handle && <p className="text-muted-foreground">@{blog.handle}</p>}
              <p className="text-sm font-mono text-muted-foreground truncate">Address: {blog.address}</p>
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary">Created: {new Date(blog.created_at).toLocaleDateString()}</Badge>
                {blog.updated_at && (
                  <Badge variant="outline">Updated: {new Date(blog.updated_at).toLocaleDateString()}</Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {blog.about && (
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{blog.about}</p>
          </CardContent>
        </Card>
      )}

      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Owner</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm font-mono">{blog.owner}</p>
        </CardContent>
      </Card>

      {blog.metadata && Object.keys(blog.metadata).length > 0 && (
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Metadata</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] w-full rounded-md border border-border">
              <div className="p-4">
                <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(blog.metadata, null, 2)}</pre>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {blog.theme && Object.keys(blog.theme).length > 0 && (
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Theme Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px] w-full rounded-md border border-border">
              <div className="p-4">
                <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(blog.theme, null, 2)}</pre>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
