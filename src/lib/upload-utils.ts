"use server";

import { env } from "@/env";
import { S3 } from "@aws-sdk/client-s3";
import type { LensClient } from "@lens-protocol/client";

const accessKeyId = env.STORAGE_ACCESS_KEY;
const secretAccessKey = env.STORAGE_SECRET_KEY;
const BUCKET_NAME = "fountain";

const s3 = new S3({
	endpoint: "https://endpoint.4everland.co",
	credentials: { accessKeyId, secretAccessKey },
	region: "4EVERLAND",
});

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

	const cid = result?.Metadata ? result.Metadata.cid : "Invalid CID";

	return `ipfs://${cid}`;
}

async function createPost(client: LensClient, contentURI: string) {
	return await client.publication.postOnchain({ contentURI });
}
