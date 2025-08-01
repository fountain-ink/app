"use client";

import { AlertTriangle, DownloadIcon, PenToolIcon, UploadIcon, UsersIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BlogDataWithSubscriberCount } from "@/app/settings/newsletter/page";
import { NewsletterDeleteDialog } from "@/components/newsletter/newsletter-delete-dialog";
import { ImportSubscribersModal } from "@/components/newsletter/newsletter-import-subscribers-modal";
import { SubscriberManagement } from "@/components/newsletter/subscriber-management";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { createMailingList, exportNewsletterSubscribers } from "@/lib/listmonk/newsletter";
import { cn } from "@/lib/utils";

interface BlogNewsletterCardProps {
  blog: BlogDataWithSubscriberCount;
}

const getBlogUrl = (blog: BlogDataWithSubscriberCount): string => {
  if (blog.handle && blog.handle !== "") {
    if (blog.slug && blog.slug !== "") {
      return `/b/${blog.handle}/${blog.slug}`;
    }
    return `/b/${blog.handle}`;
  }
  return `/b/${blog.address}`;
};

export function BlogNewsletterCard({ blog }: BlogNewsletterCardProps) {
  const router = useRouter();

  useEffect(() => {
    const handleSubscriberChange = () => {
      router.refresh();
    };

    window.addEventListener("subscriber-deleted", handleSubscriberChange);
    window.addEventListener("subscriber-added", handleSubscriberChange);
    return () => {
      window.removeEventListener("subscriber-deleted", handleSubscriberChange);
      window.removeEventListener("subscriber-added", handleSubscriberChange);
    };
  }, [router]);
  const [isLoading, setIsLoading] = useState(false);
  const [newsletterEnabled, setNewsletterEnabled] = useState(
    blog.mail_list_id !== null && blog.metadata?.newsletterEnabled !== false,
  );
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [emailContentType, setEmailContentType] = useState("full_post");
  const [imageLoaded, setImageLoaded] = useState(true);

  const toggleNewsletter = async (enabled: boolean) => {
    setIsLoading(true);

    try {
      if (enabled) {
        if (!blog.mail_list_id) {
          const result = await createMailingList(blog.address);

          if (!result?.success) {
            toast.error(result?.error || "Failed to create newsletter");
            setNewsletterEnabled(false);
            return;
          }
        }
      }

      const response = await fetch(`/api/blogs/${blog.address}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          settings: {
            metadata: {
              ...(blog.metadata || {}),
              newsletterEnabled: enabled,
              emailContentType: emailContentType,
            },
          },
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update newsletter settings");
      }

      setNewsletterEnabled(enabled);
      toast.success(`Newsletter ${enabled ? "enabled" : "disabled"} successfully`);
    } catch (error) {
      console.error("Error toggling newsletter:", error);
      toast.error(error instanceof Error ? error.message : "An error occurred");
      setNewsletterEnabled(!enabled);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailContentChange = async (value: string) => {
    setEmailContentType(value);

    try {
      const response = await fetch(`/api/blogs/${blog.address}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          settings: {
            metadata: {
              ...(blog.metadata || {}),
              emailContentType: value,
            },
          },
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update email content settings");
      }

      toast.success("Email content settings updated successfully");
    } catch (error) {
      console.error("Error updating email content settings:", error);
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  };

  const handleOpenImportModal = () => {
    setImportModalOpen(true);
  };

  const handleExport = async () => {
    try {
      await exportNewsletterSubscribers(blog.address);
      toast.success("Successfully exported subscribers");
    } catch (error) {
      console.error("Error exporting subscribers:", error);
      toast.error(error instanceof Error ? error.message : "Failed to export subscribers");
    }
  };

  const handleDeleteSuccess = () => {
    setNewsletterEnabled(false);
    router.refresh();
  };

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className={cn("p-6", newsletterEnabled ? "pb-0" : "pb-6")}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-sm bg-muted">
                {blog.icon && imageLoaded ? (
                  <Image
                    src={blog.icon}
                    alt={blog.title || "Blog icon"}
                    className="rounded-sm object-cover"
                    width={64}
                    height={64}
                    onLoadingComplete={(result) => {
                      if (result.naturalWidth === 0) {
                        setImageLoaded(false);
                      }
                    }}
                    onError={() => {
                      setImageLoaded(false);
                    }}
                  />
                ) : (
                  <PenToolIcon className="h-5 w-5" />
                )}
              </div>
              <div>
                <CardTitle className="text-lg">{blog.title || "Untitled Blog"}</CardTitle>
                <CardDescription className="mt-1 flex items-center gap-2">
                  <Link href={getBlogUrl(blog)} className="hover:underline">
                    <span>
                      {getBlogUrl(blog).slice(0, 13)}
                      {getBlogUrl(blog).length > 13 ? "..." : ""}
                    </span>
                  </Link>
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor={`newsletter-${blog.address}`} className="text-sm">
                Newsletter
              </Label>
              <Switch
                id={`newsletter-${blog.address}`}
                checked={newsletterEnabled}
                onCheckedChange={toggleNewsletter}
                className={isLoading ? "cursor-wait" : ""}
              />
            </div>
          </div>
        </CardHeader>

        {newsletterEnabled && (
          <>
            <div className="p-6 py-0 pt-4">
              <div className="h-px w-full bg-border" />
            </div>

            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* <div>
                  <h4 className="text-sm font-medium">Email content</h4>
                  <p className="text-sm text-muted-foreground mb-2">Choose what subscribers will see</p>
                  <Select
                    defaultValue={blog.metadata?.emailContentType || "notification_only"}
                    onValueChange={handleEmailContentChange}
                  >
                    <SelectTrigger className="w-full max-w-xs bg-card">
                      <SelectValue placeholder="Select email content type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_post">Full post</SelectItem>
                      <SelectItem value="first_paragraph">First paragraph</SelectItem>
                      <SelectItem value="notification_only">Notification only</SelectItem>
                    </SelectContent>
                  </Select>
                </div> */}

                {/* Warning Section */}
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-4">
                  <div className="flex gap-3">
                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      Only add people who have explicitly opted-in to receiving emails. Do not add people whose
                      information was obtained solely via the exchange of products/services, giveaways, or similar
                      collection methods.
                    </p>
                  </div>
                </div>

                <div className="">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">Import subscribers</h4>
                      <p className="text-sm text-muted-foreground">Import or export your newsletter subscribers</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="gap-2 bg-card" onClick={handleExport}>
                        <DownloadIcon className="h-4 w-4" />
                        Export
                      </Button>
                      <Button variant="outline" className="gap-2 bg-card" onClick={handleOpenImportModal}>
                        <UploadIcon className="h-4 w-4" />
                        Import
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subscriber Management Section */}
              <SubscriberManagement
                blogAddress={blog.address}
                mailListId={blog.mail_list_id}
                subscriberCount={blog.subscriber_count}
              />
            </CardContent>
          </>
        )}
      </Card>

      <ImportSubscribersModal open={importModalOpen} onOpenChange={setImportModalOpen} blogAddress={blog.address} />

      <NewsletterDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        blogAddress={blog.address}
        onSuccess={handleDeleteSuccess}
      />
    </>
  );
}
