import { NextResponse } from "next/server";
import { getMirrorContent } from "./mirror";
import { getParagraphContent } from "./paragraph";
import { getT2Content } from "./t2";

interface Post {
	title: string;
	content: string;
	timestamp: number;
	slug: string;
	subtitle?: string;
	coverImage?: string;
	preview?: string;
	// platformSpecific?: any;
}

const platformLogic = {
	t2: async (slug: string): Promise<Post> => {
		const post = await getT2Content(slug)
			.catch((error) => {
				console.error("Error:", error);
				throw error;
			})
			.then((response) => response.json());

		return {
			title: post.title,
			content: post.content,
			timestamp: post.createdAt,
			slug: post.slug,
			// subtitle: post.subtitle,
			// coverImage: post.cover_img_url,
			// preview: post.post_preview,
			// platformSpecific: {
			// 	storeOnArweave: post.storeOnArweave,
			// 	sendNewsletter: post.sendNewsletter,
			// 	published: post.published,
			// },
		};
	},
	mirror: async (slug: string): Promise<Post> => {
		const post = await getMirrorContent(slug)
			.catch((error) => {
				console.error("Error:", error);
				throw error;
			})
			.then((response) => response);

		return {
			title: post.title,
			content: post.content,
			timestamp: post.timestamp,
			slug: slug,
			// platformSpecific: {
			// 	digest: parsedContent.slug,
			// 	originalDigest: parsedContent.originalDigest,
			// },
		};
	},
	paragraph: async (slug: string): Promise<Post> => {
		const post = await getParagraphContent(slug)
			.catch((error) => {
				console.error("Error:", error);
				throw error;
			})
			.then((response) => response);

		return {
			title: post.title,
			content: JSON.stringify(post.content),
			timestamp: post.timestamp,
			slug: post.slug,
			// subtitle: parsedContent.subtitle,
			// coverImage: parsedContent.cover_img_url,
			// preview: parsedContent.post_preview,
			// platformSpecific: {
			// 	id: parsedContent.id,
			// },
		};
	},
};

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const url = searchParams.get("url");

	if (!url) {
		return NextResponse.json(
			{ error: "URL parameter is required" },
			{ status: 400 },
		);
	}

	try {
		let platform: keyof typeof platformLogic;
		let slug: string;

		if (url.includes("paragraph.xyz")) {
			platform = "paragraph";
			slug = url.split("/").pop() || "";
		} else if (url.includes("app.t2.world")) {
			platform = "t2";
			slug = url.split("/").pop() || "";
		} else if (url.includes("mirror.xyz")) {
			platform = "mirror";
			slug = url.split("/").pop() || "";
		} else {
			return NextResponse.json(
				{ error: "Unsupported platform" },
				{ status: 400 },
			);
		}

		const content = await platformLogic[platform](slug);
		return NextResponse.json(content, { status: 200 });
	} catch (error) {
		console.error("Error:", error);
		return NextResponse.json(
			{ error: "Error fetching data", details: (error as Error).message },
			{ status: 500 },
		);
	}
}
