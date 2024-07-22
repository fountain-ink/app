import { getTransactionContent, getTransactionId } from "@/lib/arweave";
import { gql } from "graphql-request";

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
	content: string;
	timestamp: number;
	digest: string;
	originalDigest: string;
}

export async function getMirrorContent(slug: string) {
	if (!slug) {
		throw new Error("Digest parameter is required");
	}

	try {
		const transactionId = await getTransactionId(query, { digest: slug });
		if (!transactionId) {
			throw new Error("No transaction found for this digest");
		}

		const content = await getTransactionContent(transactionId);
		if (!content) {
			throw new Error("Failed to decode content");
		}

		const parsedContent = JSON.parse(content);
		console.log(parsedContent, content);

		return {
			title: parsedContent.content.title,
			content: parsedContent.content.content,
			timestamp: parsedContent.content.timestamp,
			digest: parsedContent.digest,
			originalDigest: parsedContent.originalDigest,
		};
	} catch (error) {
		console.error("Error:", error);
		throw error;
	}
}
