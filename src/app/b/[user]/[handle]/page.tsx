import { notFound } from "next/navigation";
import { resolveBlogHandle } from "@/lib/settings/resolve-blog-handle";
import { UserBlogPage } from "../page";

interface PageProps {
  params: {
    user: string;
    handle: string;
  };
}

export default async function BlogHandlePage({ params }: PageProps) {
  const { user, handle } = params;
  
  const blogAddress = await resolveBlogHandle(user, handle);
  
  if (!blogAddress) {
    return notFound();
  }
  
  return <UserBlogPage params={{ user: blogAddress }} />;
} 