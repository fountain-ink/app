import { NextRequest } from "next/server";
import { getAppToken } from "@/lib/auth/get-app-token";
import { getTokenClaims } from "@/lib/auth/get-token-claims";

// Store active SSE connections per blog
const connections = new Map<string, Set<ReadableStreamDefaultController>>();

export async function GET(
  request: NextRequest,
  { params }: { params: { blog: string } }
) {
  const appToken = getAppToken();
  const claims = getTokenClaims(appToken);

  if (!claims) {
    return new Response("Unauthorized", { status: 401 });
  }

  const blogAddress = params.blog;

  // Create SSE stream
  const stream = new ReadableStream({
    start(controller) {
      // Add this connection to the blog's connection set
      if (!connections.has(blogAddress)) {
        connections.set(blogAddress, new Set());
      }
      connections.get(blogAddress)!.add(controller);

      // Send initial connection confirmation
      controller.enqueue(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);

      // Set up keep-alive ping every 30 seconds
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(`data: ${JSON.stringify({ type: 'ping' })}\n\n`);
        } catch (error) {
          // Connection closed, clean up
          clearInterval(keepAlive);
          connections.get(blogAddress)?.delete(controller);
        }
      }, 30000);

      // Clean up on close
      request.signal.addEventListener('abort', () => {
        clearInterval(keepAlive);
        connections.get(blogAddress)?.delete(controller);
        try {
          controller.close();
        } catch (error) {
          // Already closed
        }
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  });
}

// Function to broadcast updates to all connected clients for a blog
export function broadcastCrossPostUpdate(blogAddress: string, data: any) {
  const blogConnections = connections.get(blogAddress);
  if (!blogConnections) return;

  const message = `data: ${JSON.stringify({ 
    type: 'content_updated', 
    data 
  })}\n\n`;

  // Send to all connected clients for this blog
  for (const controller of blogConnections) {
    try {
      controller.enqueue(message);
    } catch (error) {
      // Remove dead connections
      blogConnections.delete(controller);
    }
  }
}