import { NextResponse } from "next/server";
import { env } from "@/env";

const allowedDomains = ["dune.com", "musescore.com"];

export const revalidate = 60 * 60 * 24 * 2; // 2 days

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const urlToEmbed = searchParams.get("url");
  const apiKey = env.IFRAMELY_API_KEY;
  const baseUrl = env.IFRAMELY_BASE_URL;

  if (!urlToEmbed) {
    return NextResponse.json({ error: "URL parameter is missing." }, { status: 400 });
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(urlToEmbed);
  } catch (error) {
    console.error("Direct API - Invalid URL format:", urlToEmbed, error);
    return NextResponse.json({ error: "Invalid URL format." }, { status: 400 });
  }

  try {
    const { hostname } = parsedUrl;
    const isAllowed = allowedDomains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));

    if (isAllowed) {
      console.log("Direct API - Creating iframe for allowed domain:", urlToEmbed);
      const wrappedHtml = `<div class="iframely-embed"><div class="iframely-responsive"><iframe src="${urlToEmbed}" allowfullscreen sandbox scrolling="no"></iframe></div></div>`;
      return NextResponse.json({ html: wrappedHtml });
    }

    console.log("Iframely API - Attempting to fetch embed for:", urlToEmbed);
    const iframelyApiUrl = `${baseUrl}/iframely?url=${encodeURIComponent(urlToEmbed)}&api_key=${apiKey}&iframe=1&omit_css=1&omit_script=1&theme=auto&lazy=1`;

    try {
      const response = await fetch(iframelyApiUrl);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Iframely API - Request failed:", response.status, response.statusText, errorData);
        return NextResponse.json(
          { error: `Iframely API request failed: ${response.statusText}`, details: errorData },
          { status: response.status },
        );
      }

      const data = await response.json();
      console.log("Iframely API - Successfully fetched embed for:", urlToEmbed);

      return NextResponse.json(data);
    } catch (iframelyError) {
      console.error("Iframely API - Network or parsing error:", iframelyError);
      return NextResponse.json({ error: "Failed to communicate with Iframely API." }, { status: 500 });
    }
  } catch (error) {
    console.error("General API error:", error);
    return NextResponse.json({ error: "Failed to fetch embed data." }, { status: 500 });
  }
}
