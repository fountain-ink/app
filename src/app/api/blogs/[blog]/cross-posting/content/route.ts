import { NextRequest, NextResponse } from "next/server";
import { getAppToken } from "@/lib/auth/get-app-token";
import { getTokenClaims } from "@/lib/auth/get-token-claims";

// Temporary in-memory storage for cross-posted content
// TODO: Replace with Supabase database storage
const crossPostedStorage = new Map<string, any[]>();

export async function GET(
  request: NextRequest,
  { params }: { params: { blog: string } }
) {
  try {
    const appToken = getAppToken();
    const claims = getTokenClaims(appToken);

    if (!claims) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get cross-posted content from memory storage
    const content = crossPostedStorage.get(params.blog) || [];
    
    // Sort by published date, newest first
    const sortedContent = content.sort((a, b) => 
      new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    );
    
    return NextResponse.json({
      content: sortedContent
    });
  } catch (error) {
    console.error("Error fetching cross-posted content:", error);
    return NextResponse.json(
      { error: "Failed to fetch cross-posted content" },
      { status: 500 }
    );
  }
}

// Export function to add content from webhook
export function addCrossPostedContent(
  blogAddress: string, 
  contentData: {
    external_post_id: string;
    external_url: string;
    title: string;
    published_at: string;
    platform: string;
    source_id: string;
    status: 'published' | 'failed' | 'draft';
    fountain_post_id?: string;
    fountain_url?: string;
  }
) {
  const existing = crossPostedStorage.get(blogAddress) || [];
  
  // Check if this content already exists
  const existingIndex = existing.findIndex(item => 
    item.external_post_id === contentData.external_post_id
  );
  
  const newContent = {
    id: `content-${Date.now()}`,
    ...contentData
  };
  
  if (existingIndex >= 0) {
    // Update existing content
    existing[existingIndex] = { ...existing[existingIndex], ...newContent };
  } else {
    // Add new content
    existing.push(newContent);
  }
  
  crossPostedStorage.set(blogAddress, existing);
  
  console.log(`Added cross-posted content for blog ${blogAddress}:`, newContent.title);
}