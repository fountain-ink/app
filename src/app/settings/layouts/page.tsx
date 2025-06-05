import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layout } from "lucide-react";

export default function LayoutsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Layout Settings</h1>
        <p className="text-muted-foreground">
          Customize the appearance and layout of your blogs
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="h-5 w-5" />
            Blog Layouts
            <Badge variant="secondary">Coming Soon</Badge>
          </CardTitle>
          <CardDescription>
            Choose themes, layouts, and styling options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Layout className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Layout customization coming soon</p>
            <p className="text-sm">Personalize your blog's appearance</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}