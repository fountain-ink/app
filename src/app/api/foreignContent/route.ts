import { NextResponse } from "next/server";
import { getMirrorContent } from "./mirror";
import { getParagraphContent } from "./paragraph";
import { getT2Content } from "./t2";

// Unified output interface
interface Content {
  title: string;
  subtitle?: string;
  content: string;
  coverImage?: string;
  createdAt: number;
  preview?: string;
  slug: string;
  platformSpecific?: any;
}

// Platform-specific logic
const platformLogic = {
  t2: async (slug: string): Promise<Content> => {

    const content = await getT2Content(slug).catch((error) => {
      console.error("Error:", error);
      throw error;
    }).then(response => response.json());


    // Return unified content
    return {
      title: content.title,
      subtitle: content.subtitle,
      content: content.content,
      coverImage: content.cover_img_url,
      createdAt: content.createdAt,
      preview: content.post_preview,
      slug: content.slug,
      platformSpecific: {
        storeOnArweave: content.storeOnArweave,
        sendNewsletter: content.sendNewsletter,
        published: content.published,
      },
    };
  },
  mirror: async (slug: string): Promise<Content> => {

    const parsedContent = await getMirrorContent(slug).catch((error) => {
      console.error("Error:", error);
      throw error;
    }).then(response => response);

    // Return unified content
    return {
      title: parsedContent.title,
      content: parsedContent.content,
      createdAt: parsedContent.timestamp,
      slug: slug,
      platformSpecific: {
        digest: parsedContent.digest,
        originalDigest: parsedContent.originalDigest,
      },
    };
  },
  paragraph: async (slug: string): Promise<Content> => {

    const parsedContent = await getParagraphContent(slug).catch((error) => {
      console.error("Error:", error);
      throw error;
    }).then(response => response);

    const jsonContent = parsedContent.content;

    return {
      title: parsedContent.title,
      subtitle: parsedContent.subtitle,
      content: JSON.stringify(jsonContent),
      coverImage: parsedContent.cover_img_url,
      createdAt: parsedContent.createdAt,
      preview: parsedContent.post_preview,
      slug: parsedContent.slug,
      platformSpecific: {
        id: parsedContent.id,
      },
    };
  },
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  
  if (!url) {
    return NextResponse.json({ error: "URL parameter is required" }, { status: 400 });
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
      return NextResponse.json({ error: "Unsupported platform" }, { status: 400 });
    }

    const content = await platformLogic[platform](slug);
    return NextResponse.json(content, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Error fetching data", details: (error as Error).message },
      { status: 500 }
    );
  }
}