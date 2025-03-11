"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { ArrowLeftIcon, MailIcon, UsersIcon } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { CreateNewsletterButton } from "@/components/newsletter/newsletter-create-button";
import { useRouter } from "next/navigation";

interface BlogNewsletterProps {
  address: string;
  title: string | null;
  about?: string | null;
  icon?: string | null;
  handle?: string | null;
  mail_list_id?: number | null;
  subscriber_count?: number;
  owner: string;
}

interface NewsletterSettingsProps {
  blogs: BlogNewsletterProps[];
}

export function NewsletterSettings({ blogs }: NewsletterSettingsProps) {
  const router = useRouter();

  const handleSuccess = () => {
    router.refresh();
  };

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
            blogs.map((blog) => (
              <Card key={blog.address} className="overflow-hidden">
                <CardHeader className="bg-muted/50 pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{blog.title || "Untitled Blog"}</CardTitle>
                      <CardDescription className="mt-1">
                        {blog.handle ? `@${blog.handle}` : blog.address}
                      </CardDescription>
                    </div>
                    {blog.mail_list_id && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <MailIcon className="h-3 w-3" />
                        Newsletter Active
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      {blog.mail_list_id ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <UsersIcon className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {blog.subscriber_count !== undefined
                                ? `${blog.subscriber_count} subscribers`
                                : "No subscribers yet"}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Your newsletter is active. Readers can subscribe from your blog.
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Create a newsletter to allow readers to subscribe to updates from this blog.
                        </p>
                      )}
                    </div>
                    <div>
                      {!blog.mail_list_id && (
                        <CreateNewsletterButton
                          blogIdentifier={blog.address}
                          onSuccess={handleSuccess}
                          variant="default"
                          size="default"
                        />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
