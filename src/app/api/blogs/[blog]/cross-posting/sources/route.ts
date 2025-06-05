import { NextRequest, NextResponse } from "next/server";
import { getAppToken } from "@/lib/auth/get-app-token";
import { getTokenClaims } from "@/lib/auth/get-token-claims";
import { getBaseUrl } from "@/lib/get-base-url";
import { memoryStorage } from "@/lib/cross-posting/memory-storage";
import Parser from "rss-parser";

async function subscribeToWebSubHub(hubUrl: string, topicUrl: string) {
  const callbackUrl = `${getBaseUrl()}/api/webhooks/websub`;
  
  const formData = new URLSearchParams({
    'hub.callback': callbackUrl,
    'hub.mode': 'subscribe',
    'hub.topic': topicUrl,
    'hub.verify': 'async',
    'hub.lease_seconds': '86400' // 24 hours
  });

  console.log('Subscribing to WebSub hub:', {
    hubUrl,
    topicUrl,
    callbackUrl
  });

  const response = await fetch(hubUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Fountain RSS Reader 1.0 (fountain.ink)'
    },
    body: formData.toString()
  });

  if (!response.ok) {
    throw new Error(`WebSub subscription failed: ${response.status} ${response.statusText}`);
  }

  console.log('WebSub subscription request sent successfully');
}

export async function POST(
  request: NextRequest,
  { params }: { params: { blog: string } }
) {
  try {
    const appToken = getAppToken();
    const claims = getTokenClaims(appToken);

    if (!claims) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { rss_url, platform } = body;

    if (!rss_url) {
      return NextResponse.json({ error: "RSS URL is required" }, { status: 400 });
    }

    // Detect platform from URL
    const detectPlatform = (url: string): string => {
      const hostname = new URL(url).hostname.toLowerCase();
      const urlPath = url.toLowerCase();
      
      if (hostname.includes('substack.com')) return 'substack';
      if (hostname.includes('medium.com') || 
          hostname.endsWith('.medium.com') || 
          urlPath.includes('medium.com/feed') ||
          urlPath.includes('@') && urlPath.includes('/feed')) return 'medium';
      if (hostname.includes('beehiiv.com')) return 'beehiiv';
      if (hostname.includes('wordpress.com') || 
          hostname.includes('wp.com') ||
          urlPath.endsWith('/feed') || 
          urlPath.endsWith('/feed/')) return 'wordpress';
      if (urlPath.includes('/rss/') || 
          urlPath.includes('/ghost/') ||
          (urlPath.includes('/feed') && !hostname.includes('medium'))) return 'ghost';
      
      return 'unknown';
    };

    const detectedPlatform = detectPlatform(rss_url);

    // Validate and parse RSS feed
    let feedTitle = '';
    let websub_supported = false;
    let websub_hub_url = '';
    
    try {
      const parser = new Parser();
      const response = await fetch(rss_url, {
        headers: {
          'User-Agent': 'Fountain RSS Reader 1.0 (fountain.ink)'
        }
      });
      
      if (!response.ok) {
        return NextResponse.json(
          { error: `Failed to fetch RSS feed: ${response.status} ${response.statusText}` },
          { status: 400 }
        );
      }
      
      const feedText = await response.text();
      
      // Check for WebSub hub in the raw XML
      const hubMatch = feedText.match(/<atom:link[^>]+rel=["']hub["'][^>]*href=["']([^"']+)["'][^>]*\/?>|<atom:link[^>]+href=["']([^"']+)["'][^>]*rel=["']hub["'][^>]*\/?>/i);
      if (hubMatch) {
        websub_supported = true;
        websub_hub_url = hubMatch[1] || hubMatch[2] || '';
      }
      
      // Parse the feed for title
      const feed = await parser.parseString(feedText);
      feedTitle = feed.title || new URL(rss_url).hostname;
      
    } catch (error) {
      console.error('Error parsing RSS feed:', error);
      return NextResponse.json(
        { error: "Invalid RSS feed or unable to fetch content" },
        { status: 400 }
      );
    }

    // Store in shared memory storage
    const newSource = {
      id: `source-${Date.now()}`,
      rss_url,
      platform: detectedPlatform,
      title: feedTitle,
      websub_supported,
      websub_hub_url: websub_supported ? websub_hub_url : undefined,
      status: 'active' as const,
      auto_publish: false,
      last_checked_at: new Date().toISOString()
    };

    memoryStorage.addSource(params.blog, newSource);

    // Subscribe to WebSub hub if supported
    if (websub_supported && websub_hub_url) {
      try {
        console.log(`🔔 Attempting WebSub subscription to hub: ${websub_hub_url} for feed: ${rss_url}`);
        await subscribeToWebSubHub(websub_hub_url, rss_url);
        console.log(`✅ Successfully subscribed to WebSub hub: ${websub_hub_url} for feed: ${rss_url}`);
      } catch (error) {
        console.error('❌ Failed to subscribe to WebSub hub:', error);
        // Don't fail the whole request if WebSub subscription fails
        // But log the detailed error
        console.error('WebSub subscription error details:', {
          hub: websub_hub_url,
          topic: rss_url,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    } else {
      console.log(`ℹ️ WebSub not supported for feed: ${rss_url}`);
    }

    return NextResponse.json(newSource);
  } catch (error) {
    console.error("Error adding RSS source:", error);
    return NextResponse.json(
      { error: "Failed to add RSS source" },
      { status: 500 }
    );
  }
}