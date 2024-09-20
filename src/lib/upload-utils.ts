"use server";

import { env } from "@/env";
import { S3 } from "@aws-sdk/client-s3";

const accessKeyId = env.STORAGE_ACCESS_KEY;
const secretAccessKey = env.STORAGE_SECRET_KEY;
const BUCKET_NAME = "fountain";

const s3 = new S3({
  endpoint: "https://endpoint.4everland.co",
  credentials: { accessKeyId, secretAccessKey },
  region: "4EVERLAND",
});

export async function uploadFile(formData: FormData) {
  const file = formData.get("file") as File;
  const handle = formData.get("handle") as string;

  if (!file || !handle) {
    throw new Error("File or handle is missing");
  }

  const fileBuffer = await file.arrayBuffer();
  const date = new Date().toISOString();
  const key = `users/${handle}/${date}_${file.name}`;

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

  return `ipfs://${cid}`;
}

export async function uploadMetadata(data: any, handle: string) {
  const metadata = JSON.stringify(data);
  const date = new Date().toISOString();
  const key = `users/${handle}/${date}_metadata.json`;

  await s3.putObject({
    ContentType: "application/json",
    Bucket: BUCKET_NAME,
    Body: metadata,
    Key: key,
  });

  const result = await s3.headObject({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  const cid = result?.Metadata ? result.Metadata["ipfs-hash"] : "";

  return `ipfs://${cid}`;
}
