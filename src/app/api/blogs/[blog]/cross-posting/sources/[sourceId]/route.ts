import { NextRequest, NextResponse } from "next/server";
import { getAppToken } from "@/lib/auth/get-app-token";
import { getTokenClaims } from "@/lib/auth/get-token-claims";
import { memoryStorage } from "@/lib/cross-posting/memory-storage";

export async function PUT(
  request: NextRequest,
  { params }: { params: { blog: string; sourceId: string } }
) {
  try {
    const appToken = getAppToken();
    const claims = getTokenClaims(appToken);

    if (!claims) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
    // Update source in shared memory storage
    const success = memoryStorage.updateSource(params.blog, params.sourceId, body);
    
    if (!success) {
      return NextResponse.json({ error: "Source not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating RSS source:", error);
    return NextResponse.json(
      { error: "Failed to update RSS source" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { blog: string; sourceId: string } }
) {
  try {
    const appToken = getAppToken();
    const claims = getTokenClaims(appToken);

    if (!claims) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Remove source from shared memory storage
    const success = memoryStorage.removeSource(params.blog, params.sourceId);
    
    if (!success) {
      return NextResponse.json({ error: "Source not found" }, { status: 404 });
    }
    
    // TODO: Unsubscribe from WebSub hub if applicable
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting RSS source:", error);
    return NextResponse.json(
      { error: "Failed to delete RSS source" },
      { status: 500 }
    );
  }
}