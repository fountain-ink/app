import { env } from "@/env";
import { S3 } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/verify-auth-token";
import { getTokenClaims } from "@/lib/auth/get-token-claims";
import { createLensClient } from "@/lib/auth/get-lens-client";
import { getUserProfile } from "@/lib/auth/get-user-profile";

const accessKeyId = env.STORAGE_ACCESS_KEY;
const secretAccessKey = env.STORAGE_SECRET_KEY;
const BUCKET_NAME = "fountain";

const s3 = new S3({
  endpoint: "https://endpoint.4everland.co",
  credentials: { accessKeyId, secretAccessKey },
  region: "4EVERLAND",
});

export async function POST(request: NextRequest) {
  try {
    const appToken = request.cookies.get("appToken")?.value;
    const verified = verifyToken(appToken, env.SUPABASE_JWT_SECRET);
    if (!appToken || !verified) {
      console.log("Upload attempt with invalid token");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const claims = getTokenClaims(appToken);
    if (!claims) {
      console.log("Upload attempt with invalid claims");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profileId = claims.sub;

    // If not a guest user, verify with Lens
    if (!claims.user_metadata.isAnonymous) {
      const lens = await createLensClient();
      const { profileId: lensProfileId } = await getUserProfile(lens);

      if (lensProfileId !== profileId) {
        console.log("Upload attempt with mismatched Lens profile");
        return NextResponse.json({ error: "Invalid profile" }, { status: 401 });
      }
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      console.log("Upload attempt without file");
      return NextResponse.json(
        { error: "File is missing" },
        { status: 400 }
      );
    }

    const fileBuffer = await file.arrayBuffer();
    const date = new Date().toISOString();
    const key = `users/${profileId}/${date}_${file.name}`;

    console.log(`Uploading file ${file.name} for user ${profileId}`);
    
    await s3.putObject({
      ContentType: file.type,
      Bucket: BUCKET_NAME,
      Body: Buffer.from(fileBuffer),
      Key: key,
    });

    const result = await s3.headObject({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const cid = result?.Metadata ? result.Metadata["ipfs-hash"] : "";
    console.log(`Successfully uploaded file ${file.name} with CID ${cid}`);
    
    return NextResponse.json({ url: `ipfs://${cid}` });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
} 