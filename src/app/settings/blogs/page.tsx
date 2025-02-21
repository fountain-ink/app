"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Plus } from "lucide-react";
import { getLensClient } from "@/lib/lens/client";
import { CreateBlogModal } from "@/components/blog/create-blog-modal";

export default function BlogsSettingsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreateSuccess = () => {
    // Refresh the blogs list
    // TODO: Add blogs list refresh logic
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Blogs</CardTitle>
            <CardDescription>Manage your blogs and create new ones.</CardDescription>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)} className="ml-4">
            <Plus className="w-4 h-4 mr-2" />
            Create Blog
          </Button>
        </CardHeader>
        <CardContent>
          {/* TODO: Add blogs list here */}
          <p className="text-sm text-muted-foreground">No blogs created yet.</p>
        </CardContent>
      </Card>

      <CreateBlogModal  
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={handleCreateSuccess}
      />
    </>
  );
} 