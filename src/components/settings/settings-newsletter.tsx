import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BlogNewsletterCard } from "@/components/blog/blog-newsletter-card";
import { BlogDataWithSubscriberCount } from "@/app/settings/newsletter/page";

interface NewsletterSettingsProps {
  blogs: BlogDataWithSubscriberCount[];
}

export function NewsletterSettings({ blogs }: NewsletterSettingsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Newsletter Settings</CardTitle>
          <CardDescription>Manage newsletter settings for your blogs</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {blogs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No blogs found. Create a blog first to set up newsletters.</p>
          ) : (
            blogs.map((blog: BlogDataWithSubscriberCount) => <BlogNewsletterCard key={blog.address} blog={blog} />)
          )}
        </div>
      </CardContent>
    </Card>
  );
}
