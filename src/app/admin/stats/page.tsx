"use client";

import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type StatsData = {
  users: {
    total: number;
    guest: number;
    evm: number;
    other: number;
    active: number;
  };
  content: {
    blogs: number;
    drafts: number;
    total: number;
  };
};

export default function StatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/admin/stats");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to fetch stats");
        }

        setStats(result.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching stats:", err);
        setError(err instanceof Error ? err.message : "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Analytics Dashboard</CardTitle>
          <CardDescription>View detailed metrics and statistics about your application</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="users" className="space-y-4">
            <TabsList>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-4">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatsCardSkeleton />
                  <StatsCardSkeleton />
                  <StatsCardSkeleton />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatsCard title="Total Users" value={stats?.users.total.toString() || "0"} />
                  <StatsCard
                    title="Authenticated Users"
                    value={stats?.users.evm.toString() || "0"}
                    subtext={stats ? `${Math.round((stats.users.evm / stats.users.total) * 100)}% of total` : undefined}
                  />
                  <StatsCard
                    title="Guest Users"
                    value={stats?.users.guest.toString() || "0"}
                    subtext={
                      stats ? `${Math.round((stats.users.guest / stats.users.total) * 100)}% of total` : undefined
                    }
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <StatsCardSkeleton />
                  <StatsCardSkeleton />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <StatsCard title="Blogs" value={stats?.content.blogs.toString() || "0"} />
                  <StatsCard title="Drafts" value={stats?.content.drafts.toString() || "0"} />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function StatsCard({ title, value, subtext }: { title: string; value: string; subtext?: string }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

function StatsCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-32" />
        </div>
      </CardContent>
    </Card>
  );
}
