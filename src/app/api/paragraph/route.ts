import { getTransactionContent, getTransactionId } from "@/lib/arweave";
import { gql } from "graphql-request";
import { NextResponse } from "next/server";

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

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const slug = searchParams.get("slug");
	if (!slug) {
		return NextResponse.json(
			{ error: "Slug parameter is required" },
			{ status: 400 },
		);
	}

	try {
		const transactionId = await getTransactionId(query, { slug });
		if (!transactionId) {
			return NextResponse.json(
				{ error: "No transaction found for this slug" },
				{ status: 404 },
			);
		}

		const decodedContent = await getTransactionContent(transactionId);
		const parsedContent: ParagraphPost = JSON.parse(decodedContent);
		const jsonContent = JSON.parse(parsedContent.json);

		return NextResponse.json({
			content: jsonContent || "",
			cover_img_url: parsedContent.cover_img_url,
			createdAt: parsedContent.createdAt,
			title: parsedContent.title,
			subtitle: parsedContent.subtitle,
			post_preview: parsedContent.post_preview,
			id: parsedContent.id,
			slug: parsedContent.slug,
		});
	} catch (error) {
		console.error("Error:", error);
		return NextResponse.json(
			{ error: "Error fetching data", details: (error as Error).message },
			{ status: 500 },
		);
	}
}
