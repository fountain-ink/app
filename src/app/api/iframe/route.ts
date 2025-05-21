import { env } from '@/env';
import { NextResponse } from 'next/server';

export const revalidate = 60 * 60 * 24 * 2; // 2 days

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const urlToEmbed = searchParams.get('url');
  const apiKey = env.IFRAMELY_API_KEY;
  const baseUrl = env.IFRAMELY_BASE_URL;

  if (!urlToEmbed) {
    return NextResponse.json(
      { error: 'URL parameter is missing.' },
      { status: 400 }
    );
  }

  try {
    const iframelyApiUrl = `${baseUrl}/iframely?url=${encodeURIComponent(urlToEmbed)}&api_key=${apiKey}&iframe=1&omit_css=1&omit_script=1&theme=auto`;
    const response = await fetch(iframelyApiUrl);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Iframely API error:', response.status, errorData);
      return NextResponse.json(
        { error: `Iframely API request failed: ${response.statusText}`, details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching from Iframely through API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch embed data.' },
      { status: 500 }
    );
  }
}
