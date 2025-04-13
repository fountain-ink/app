"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function StatsPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Analytics Dashboard</CardTitle>
          <CardDescription>
            View detailed metrics and statistics about your application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="users" className="space-y-4">
            <TabsList>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatsCard title="Total Users" value="12,345" change="+12.3%" />
                <StatsCard title="Active Users" value="8,765" change="+5.7%" />
                <StatsCard title="New Signups" value="432" change="+22.5%" period="This week" />
              </div>
              <div className="h-[300px] bg-muted/30 rounded-md flex items-center justify-center">
                <p className="text-muted-foreground">User growth chart would appear here</p>
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatsCard title="Total Posts" value="5,678" change="+8.1%" />
                <StatsCard title="Comments" value="15,432" change="+14.2%" />
                <StatsCard title="New Content" value="124" change="-3.5%" period="This week" />
              </div>
              <div className="h-[300px] bg-muted/30 rounded-md flex items-center justify-center">
                <p className="text-muted-foreground">Content engagement chart would appear here</p>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatsCard title="Avg. Load Time" value="0.42s" change="-15.3%" indicator="positive" />
                <StatsCard title="API Calls" value="250k" change="+18.7%" indicator="negative" />
                <StatsCard title="Error Rate" value="0.12%" change="-5.3%" indicator="positive" />
              </div>
              <div className="h-[300px] bg-muted/30 rounded-md flex items-center justify-center">
                <p className="text-muted-foreground">Performance metrics chart would appear here</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function StatsCard({
  title,
  value,
  change,
  period = "Last 30 days",
  indicator
}: {
  title: string;
  value: string;
  change: string;
  period?: string;
  indicator?: "positive" | "negative";
}) {
  // Determine if change is positive or negative if not explicitly specified
  const isPositive = indicator
    ? indicator === "positive"
    : change.startsWith("+");

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          <div className="flex items-center space-x-2">
            <span className={`text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {change}
            </span>
            <span className="text-xs text-muted-foreground">{period}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 