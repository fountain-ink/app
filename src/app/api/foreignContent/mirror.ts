import {
	getTransactionContent,
	getTransactionId,
} from "@/lib/get-arweave-content";
import { gql } from "graphql-request";
import markdownit from "markdown-it";

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
	slug: string;
}

function stripImgTags(content: string): string {
	const regex = /<p>\s*(<img[^>]+>)\s*<\/p>/g;

	// Replace matches with just the <img> tag
	return content.replace(regex, "$1");
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

		const post = await getTransactionContent(transactionId);
		if (!post) {
			throw new Error("Failed to decode content");
		}

		const parsedPost = JSON.parse(post);
		const markdownContent = parsedPost.content.body;
		const converter = markdownit();
		const content = stripImgTags(converter.render(markdownContent));

		return {
			title: parsedPost.content.title,
			content: content,
			timestamp: parsedPost.content.timestamp,
			slug: parsedPost.digest,
		} as MirrorContent;
	} catch (error) {
		console.error("Error:", error);
		throw error;
	}
}
