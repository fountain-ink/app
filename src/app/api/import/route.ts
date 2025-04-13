import { NextResponse } from "next/server";
import { getMirrorContent } from "./mirror";
import { getParagraphContent } from "./paragraph";
import { getT2Content } from "./t2";

export interface ForeignPost {
  title: string;
  content: string;
  timestamp: number;
  coverImageUrl?: string;
  slug: string;
}

const platformLogic = {
  t2: async (slug: string): Promise<ForeignPost> => {
    const post = await getT2Content(slug)
      .catch((error) => {
        console.error("Error:", error);
        throw error;
      })
      .then((response) => response.json());

    return post;
  },
  mirror: async (slug: string): Promise<ForeignPost> => {
    const post = await getMirrorContent(slug)
      .catch((error) => {
        console.error("Error:", error);
        throw error;
      })
      .then((response) => response);

    return post;
  },
  paragraph: async (slug: string): Promise<ForeignPost> => {
    const post = await getParagraphContent(slug)
      .catch((error) => {
        console.error("Error:", error);
        throw error;
      })
      .then((response) => response);

    return post;
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

    if (url.includes("paragraph.xyz") || url.includes("paragraph.com")) {
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
    return NextResponse.json({ error: "Error fetching data", details: (error as Error).message }, { status: 500 });
  }
}
