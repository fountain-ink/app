import Editor from "@/components/editor/editor";
import { ArticleLayout } from "@/components/navigation/article-layout";
import { getAppToken } from "@/lib/auth/get-app-token";
import { getUserAccount } from "@/lib/auth/get-user-profile";
import { defaultContent } from "@/lib/plate/default-content"; // For fallback
import { headers } from "next/headers"; // Keep for appToken
import { redirect } from "next/navigation"; // For error handling

// Helper function to fetch draft data (could be moved to a lib file)
async function getDraftData(documentId: string, appToken: string | undefined) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"; // Ensure this env var is set
  const res = await fetch(`${baseUrl}/api/drafts?id=${documentId}`, {
    headers: {
      Cookie: headers().get("cookie") || "", // Pass along cookies for auth
    },
    cache: "no-store", // Ensure fresh data
  });

  if (!res.ok) {
    if (res.status === 404) {
      return null; // Draft not found
    }
    throw new Error(`Failed to fetch draft: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return data.draft;
}

export default async function WriteDraft({ params }: { params: { id: string } }) {
  const { username } = await getUserAccount(); // Assuming this is still needed for Editor
  const appToken = getAppToken(); // Still needed for Yjs auth if collaborative

  const draftData = await getDraftData(params.id, appToken);

  if (!draftData) {
    // Handle draft not found, e.g., redirect or show error page
    // For now, let's redirect to a generic error or drafts page
    // This could be a redirect to /home or a specific error component
    console.warn(`Draft with id ${params.id} not found. Redirecting.`);
    // Before redirecting, ensure no further headers are set by returning immediately.
    // Or use a proper error component. For simplicity, redirecting.
    // This might not be the best UX, consider an error page.
    redirect("/home"); // Or some other appropriate page
  }

  const initialContent = draftData.contentJson || defaultContent;
  const isCollaborative = draftData.isCollaborative || false;

  return (
    <ArticleLayout>
      <Editor
        documentId={params.id} // Explicitly pass documentId
        initialContentJson={initialContent}
        isCollaborative={isCollaborative}
        showToc
        username={username}
        appToken={appToken}
        // pathname prop might be deprecated or used differently now that documentId is explicit
        // For Yjs, the documentId (params.id) will be the channel/document name
      />
    </ArticleLayout>
  );
}
