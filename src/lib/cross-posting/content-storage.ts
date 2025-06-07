// Temporary in-memory storage for cross-posted content
// TODO: Replace with Supabase database storage
const crossPostedStorage = new Map<string, any[]>();

export interface CrossPostedContentData {
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

export function getCrossPostedContent(blogAddress: string) {
  const content = crossPostedStorage.get(blogAddress) || [];
  
  // Sort by published date, newest first
  return content.sort((a, b) => 
    new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
  );
}

export function addCrossPostedContent(
  blogAddress: string, 
  contentData: CrossPostedContentData
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
  
  return newContent;
}