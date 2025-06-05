import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import Parser from "rss-parser";
import { memoryStorage } from "@/lib/cross-posting/memory-storage";
import { addCrossPostedContent } from "@/lib/cross-posting/content-storage";
import { broadcastCrossPostUpdate } from "@/lib/cross-posting/sse-broadcast";

export async function GET(request: NextRequest) {
  // Handle WebSub subscription verification challenge
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const topic = searchParams.get('hub.topic');
  const challenge = searchParams.get('hub.challenge');
  const lease_seconds = searchParams.get('hub.lease_seconds');

  console.log('WebSub verification request:', { mode, topic, challenge, lease_seconds });

  if (mode === 'subscribe' && challenge) {
    // Verify that we actually requested this subscription
    // TODO: Check our database to confirm we have this RSS URL
    console.log(`WebSub subscription confirmed for topic: ${topic}`);
    
    // Return the challenge to confirm subscription
    return new Response(challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
  }

  if (mode === 'unsubscribe' && challenge) {
    console.log(`WebSub unsubscription confirmed for topic: ${topic}`);
    return new Response(challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
  }

  return NextResponse.json({ error: 'Invalid WebSub verification request' }, { status: 400 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const contentType = request.headers.get('content-type') || '';
    
    console.log('WebSub notification received:', {
      contentType,
      bodyLength: body.length,
      headers: Object.fromEntries(request.headers.entries())
    });

    // Verify signature if provided (recommended for security)
    const signature = request.headers.get('x-hub-signature') || request.headers.get('x-hub-signature-256');
    if (signature) {
      // TODO: Verify HMAC signature using shared secret
      console.log('WebSub signature:', signature);
    }

    // Parse the RSS/Atom feed content
    if (contentType.includes('application/rss+xml') || 
        contentType.includes('application/atom+xml') || 
        contentType.includes('text/xml') ||
        contentType.includes('application/xml')) {
      
      await handleFeedUpdate(body);
      
      return new Response('OK', { status: 200 });
    }

    console.log('WebSub notification with unsupported content type:', contentType);
    return new Response('Unsupported content type', { status: 400 });

  } catch (error) {
    console.error('Error processing WebSub notification:', error);
    return NextResponse.json(
      { error: 'Failed to process WebSub notification' },
      { status: 500 }
    );
  }
}

async function handleFeedUpdate(feedContent: string) {
  try {
    const parser = new Parser();
    const feed = await parser.parseString(feedContent);
    
    console.log(`WebSub feed update received: ${feed.title}`);
    console.log(`Feed has ${feed.items?.length || 0} items`);

    if (feed.items && feed.items.length > 0) {
      // Get the latest item (most recent post)
      const latestItem = feed.items[0];
      
      if (!latestItem) {
        console.log('No latest item found in feed');
        return;
      }
      
      console.log('Latest post:', {
        title: latestItem.title,
        link: latestItem.link,
        pubDate: latestItem.pubDate,
        guid: latestItem.guid
      });

      // Find which RSS source this belongs to
      const feedUrl = feed.feedUrl || feed.link;
      let matchingSource = null;
      let blogAddress = null;
      
      // Search through all blogs to find the matching RSS source
      // TODO: This is inefficient, should be indexed in database
      for (const [blog, sources] of memoryStorage.getAllSources()) {
        const source = sources.find(s => 
          feedUrl && (s.rss_url === feedUrl || feedUrl.includes(s.rss_url) || s.rss_url.includes(feedUrl))
        );
        if (source) {
          matchingSource = source;
          blogAddress = blog;
          break;
        }
      }
      
      if (matchingSource && blogAddress) {
        console.log(`🎉 New post detected via WebSub for blog ${blogAddress}!`);
        console.log(`Title: ${latestItem.title}`);
        console.log(`URL: ${latestItem.link}`);
        console.log(`Published: ${latestItem.pubDate}`);
        
        // Add to cross-posted content list
        const newContent = {
          external_post_id: latestItem.guid || latestItem.link || '',
          external_url: latestItem.link || '',
          title: latestItem.title || 'Untitled',
          published_at: latestItem.pubDate || new Date().toISOString(),
          platform: matchingSource.platform,
          source_id: matchingSource.id,
          status: (matchingSource.auto_publish ? 'published' : 'draft') as 'published' | 'failed' | 'draft'
        };
        
        addCrossPostedContent(blogAddress, newContent);
        
        // Broadcast update to connected clients
        broadcastCrossPostUpdate(blogAddress, newContent);
        
        console.log('✅ Added to cross-posted content list and broadcasted update');
      } else {
        console.log('⚠️ Could not find matching RSS source for feed:', feedUrl);
      }
    }

  } catch (error) {
    console.error('Error parsing WebSub feed content:', error);
  }
}