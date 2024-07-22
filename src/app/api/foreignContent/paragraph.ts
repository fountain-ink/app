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
	cover_img_url: string;
	createdAt: number;
	post_preview: string;
	title: string;
	subtitle: string;
	id: string;
	storeOnArweave: boolean;
	sendNewsletter: boolean;
	published: boolean;
	json: string;
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
		const jsonContent = JSON.parse(parsedContent.json);

		return {
			content: jsonContent || "",
			cover_img_url: parsedContent.cover_img_url,
			createdAt: parsedContent.createdAt,
			title: parsedContent.title,
			subtitle: parsedContent.subtitle,
			post_preview: parsedContent.post_preview,
			id: parsedContent.id,
			slug: parsedContent.slug,
		};

	} catch (error) {
		console.error("Error:", error);
		throw error;
	}
}
