import edjsHTML from "editorjs-html";
import { JSDOM } from "jsdom";
import { NextResponse } from "next/server";
import { getTransactionContent } from "@/lib/get-arweave-content";

interface T2Post {
  coverImageUrl: string;
  createdAt: number;
  postPreview: string;
  title: string;
  subtitle: string;
  id: string;
  content: string;
  storeOnArweave: boolean;
  sendNewsletter: boolean;
  published: boolean;
  json: string;
  slug: string;
}

async function fetchPageContent(slug: string): Promise<string> {
  const response = await fetch(`https://app.t2.world/article/${slug}`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.text();
}

function extractTransactionId(html: string): string | null {
  const dom = new JSDOM(html);
  const document = dom.window.document;

  const linkElement = document.querySelector('a[href^="https://viewblock.io/arweave/tx/"]');

  if (linkElement) {
    const href = linkElement.getAttribute("href");
    if (href) {
      const match = href.match(/\/tx\/(.+)$/);
      if (match?.[1]) {
        return match[1];
      }
    }
  }
  return null;
}

async function getTransactionId(slug: string): Promise<string | null> {
  const pageContent = await fetchPageContent(slug);
  return extractTransactionId(pageContent);
}

export async function getT2Content(slug: string) {
  if (!slug) {
    throw new Error("Slug parameter is required");
  }
  try {
    const transactionId = await getTransactionId(slug);

    if (!transactionId) {
      throw new Error("No transaction found for this slug");
    }

    const decodedContent = await getTransactionContent(transactionId);
    if (!decodedContent) {
      throw new Error("Failed to decode content");
    }

    const edjsParser = edjsHTML();
    const { content } = JSON.parse(decodedContent);
    const htmlContent = edjsParser.parse(content.body);

    const post: T2Post = {
      content: htmlContent.join(""),
      title: content.title,
      subtitle: content.subtitle,
      coverImageUrl: content.cover_img_url,
      createdAt: content.createdAt,
      postPreview: content.post_preview,
      id: content.id,
      slug: content.slug,
      storeOnArweave: content.storeOnArweave,
      sendNewsletter: content.sendNewsletter,
      published: content.published,
      json: decodedContent,
    };

    return NextResponse.json(post, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}
