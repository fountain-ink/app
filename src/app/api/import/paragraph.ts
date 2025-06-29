import { gql } from "graphql-request";
import { getTransactionContent, getTransactionId } from "@/lib/get-arweave-content";

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
  timestamp: number;
  content: string;
  slug: string;
  coverImageUrl: string;
}

export async function getParagraphContent(slug: string) {
  if (!slug) {
    throw new Error("Slug parameter is required");
  }

  try {
    const transactionId = await getTransactionId(query, { slug });
    if (!transactionId) {
      throw new Error("No transaction found for this slug");
    }

    const content = await getTransactionContent(transactionId);
    if (!content) {
      throw new Error("Failed to decode content");
    }

    const parsedContent = JSON.parse(content);

    return {
      title: parsedContent.title,
      content: parsedContent.staticHtml,
      timestamp: parsedContent.timestamp,
      slug: parsedContent.slug,
      coverImageUrl: parsedContent.cover_img.img.src,
    } as ParagraphPost;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}
