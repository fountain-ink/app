import Arweave from "arweave";
import { GraphQLClient, gql } from "graphql-request";
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

const graphqlAPI = "https://arweave.net/graphql";

const arweave = Arweave.init({
	host: "arweave.net",
	port: 443,
	protocol: "https",
});

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

	const client = new GraphQLClient(graphqlAPI);

	try {
		// Step 1: Get the transaction ID using the slug
		const data = await client.request(query, { slug });
		console.log(data.transactions.edges);
		const transactionId = data.transactions.edges[0]?.node.id;

		if (!transactionId) {
			return NextResponse.json(
				{ error: "No transaction found for this slug" },
				{ status: 404 },
			);
		}

		// Step 2: Retrieve the transaction data
		const transaction = await arweave.transactions.get(transactionId);

		// Step 3: Decode the transaction data
		const decoder = new TextDecoder();
		const decodedContent = decoder.decode(transaction.data);

		// Step 4: Parse the content
		const parsedContent: ParagraphPost = JSON.parse(decodedContent);

		// Step 5: Parse the JSON field
		const jsonContent = JSON.parse(parsedContent.json);

		// Step 6: Return the structured content
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
