import { CrossPostingSettings } from "@/components/settings/settings-cross-posting";
import { getAppToken } from "@/lib/auth/get-app-token";
import { getTokenClaims } from "@/lib/auth/get-token-claims";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/db/server";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PageProps {
  params: {
    blog: string;
  };
}

export default async function CrossPostingPage({ params }: PageProps) {
  const appToken = getAppToken();
  const claims = getTokenClaims(appToken);

  if (!claims) {
    return notFound();
  }

  const db = await createClient();
  const { data: blog } = await db.from("blogs").select().eq("address", params.blog).single();

  if (!blog) {
    return notFound();
  }

  const isUserBlog = blog.address === claims.metadata.address;
  const blogTitle = blog.title || "Untitled Blog";

  return (
    <div className="container max-w-4xl mx-auto py-8 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div>
            <div className="mb-2">
              <Link
                href={`/settings/b/${params.blog}`}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-muted-foreground hover:text-accent-foreground h-9 px-3 py-0 pb-2 pl-0"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Blog Settings
              </Link>
            </div>
            <CardTitle>Cross-posting Settings</CardTitle>
            <CardDescription>
              Automatically import content from your other blogs - {blogTitle}
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

      <CrossPostingSettings blogAddress={params.blog} />
    </div>
  );
}