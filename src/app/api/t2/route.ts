import { getTransactionContent } from "@/lib/arweave";
import edjsHTML from "editorjs-html";
import { JSDOM } from "jsdom";
import { NextResponse } from "next/server";

interface T2Post {
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

	const linkElement = document.querySelector(
		'a[href^="https://viewblock.io/arweave/tx/"]',
	);
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
		const transactionId = await getTransactionId(slug);

		if (!transactionId) {
			return NextResponse.json(
				{ error: "No transaction found for this slug" },
				{ status: 404 },
			);
		}

		const decodedContent = await getTransactionContent(transactionId);
		if (!decodedContent) {
			return NextResponse.json(
				{ error: "Failed to decode content" },
				{ status: 500 },
			);
		}

		const edjsParser = edjsHTML();
		const { content } = JSON.parse(decodedContent);
		const htmlContent = edjsParser.parse(content.body);

		return NextResponse.json({
			content: htmlContent || "",
			cover_img_url: content.cover_img_url,
			createdAt: content.createdAt,
			title: content.title,
			subtitle: content.subtitle,
			post_preview: content.post_preview,
			id: content.id,
			slug: content.slug,
		});
	} catch (error) {
		console.error("Error:", error);
		return NextResponse.json(
			{ error: "Error fetching data", details: (error as Error).message },
			{ status: 500 },
		);
	}
}
