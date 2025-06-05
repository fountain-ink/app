import { NextRequest, NextResponse } from "next/server";
import { getAppToken } from "@/lib/auth/get-app-token";
import { getTokenClaims } from "@/lib/auth/get-token-claims";

export async function POST(
  request: NextRequest,
  { params }: { params: { blog: string } }
) {
  try {
    const appToken = getAppToken();
    const claims = getTokenClaims(appToken);

    if (!claims) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Implement Lens Account Manager delegation
    // - Use Lens SDK to create delegation
    // - Store delegation token and permissions
    // - Return delegation status
    
    // For now, return mock success response
    return NextResponse.json({
      is_delegated: true,
      lens_account_id: claims.metadata.address,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      permissions: ['post'],
      status: 'active'
    });
  } catch (error) {
    console.error("Error creating delegation:", error);
    return NextResponse.json(
      { error: "Failed to create delegation" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { blog: string } }
) {
  try {
    const appToken = getAppToken();
    const claims = getTokenClaims(appToken);

    if (!claims) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Implement delegation revocation
    // - Revoke delegation on Lens
    // - Remove from database
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error revoking delegation:", error);
    return NextResponse.json(
      { error: "Failed to revoke delegation" },
      { status: 500 }
    );
  }
}