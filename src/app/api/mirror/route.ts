import { getTransactionContent, getTransactionId } from "@/lib/arweave";
import { gql } from "graphql-request";
import { NextResponse } from "next/server";

const query = gql`
  query GetMirrorTransactions($digest: String!) {
    transactions(tags:[
      { name:"App-Name", values:["MirrorXYZ"] },
      { name:"Original-Content-Digest", values:[$digest] }
    ], sort:HEIGHT_DESC, first: 1){
      edges {
        node {
          id
        }
      }
    }
  }
`;

interface MirrorContent {
	title: string;
	body: string;
	timestamp: number;
}

interface DecodedContent {
	content: MirrorContent;
	digest: string;
	originalDigest: string;
}

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const digest = searchParams.get("digest");
	if (!digest) {
		return NextResponse.json(
			{ error: "Digest parameter is required" },
			{ status: 400 },
		);
	}

	try {
		const transactionId = await getTransactionId(query, { digest });
		if (!transactionId) {
			return NextResponse.json(
				{ error: "No transaction found" },
				{ status: 404 },
			);
		}

		const decodedContent = await getTransactionContent(transactionId);
		if (!decodedContent) {
			return NextResponse.json(
				{ error: "No decoded content found" },
				{ status: 500 },
			);
		}

		const parsedContent: DecodedContent = JSON.parse(decodedContent);

		return NextResponse.json({
			title: parsedContent.content.title,
			body: parsedContent.content.body,
			timestamp: parsedContent.content.timestamp,
			digest: parsedContent.digest,
			originalDigest: parsedContent.originalDigest,
		});
	} catch (error) {
		console.error("Error:", error);
		return NextResponse.json(
			{ error: "Error fetching data", details: (error as Error).message },
			{ status: 500 },
		);
	}
}
