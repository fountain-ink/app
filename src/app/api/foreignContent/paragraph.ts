import { getTransactionContent, getTransactionId } from "@/lib/arweave";
import { gql } from "graphql-request";

const query = gql`
  query GetParagraphPost($slug: String!) {
    transactions(
      tags: [
        { name: "AppName", values: ["Paragraph"] },
        { name: "PostSlug", values: [$slug] }
      ],
      sort: HEIGHT_DESC,
      first: 1
    ) {
      edges {
        node {
          id
        }
      }
    }
  }
`;

interface ParagraphPost {
	title: string;
	// subtitle: string;
	timestamp: number;
	content: string;
	slug: string;
}

export async function getParagraphContent(slug:string) {
	if (!slug) {
		throw new Error("Slug parameter is required");
	}

	try {
		const transactionId = await getTransactionId(query, { slug });
		if (!transactionId) {
			throw new Error("No transaction found for this slug");
		}

		const decodedContent = await getTransactionContent(transactionId);
		if (!decodedContent) {
			throw new Error("Failed to decode content");
		}

		const parsedContent: ParagraphPost = JSON.parse(decodedContent);
		const jsonContent = JSON.parse(parsedContent.content);

		return {
			// cover_img_url: parsedContent.cover_img_url,
			// post_preview: parsedContent.post_preview,
			// id: parsedContent.id,
			// subtitle: parsedContent.subtitle,
			title: parsedContent.title,
			content: jsonContent,
			timestamp: parsedContent.timestamp,
			slug: parsedContent.slug,
		} as ParagraphPost;

	} catch (error) {
		console.error("Error:", error);
		throw error;
	}
}
