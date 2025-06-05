import { NextRequest } from "next/server";
import { getAppToken } from "@/lib/auth/get-app-token";
import { getTokenClaims } from "@/lib/auth/get-token-claims";
import { addSSEConnection, removeSSEConnection } from "@/lib/cross-posting/sse-broadcast";

export async function GET(
  request: NextRequest,
  { params }: { params: { blog: string } }
) {
  try {
    const appToken = getAppToken();
    const claims = getTokenClaims(appToken);

    if (!claims) {
      console.log('SSE connection failed: No auth token');
      return new Response("Unauthorized", { status: 401 });
    }

    console.log(`SSE connection established for blog: ${params.blog}`);

  const blogAddress = params.blog;

  // Create SSE stream
  const stream = new ReadableStream({
    start(controller) {
      // Add this connection to the blog's connection set
      addSSEConnection(blogAddress, controller);

      // Send initial connection confirmation
      controller.enqueue(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);

      // Set up keep-alive ping every 30 seconds
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(`data: ${JSON.stringify({ type: 'ping' })}\n\n`);
        } catch (error) {
          // Connection closed, clean up
          clearInterval(keepAlive);
          removeSSEConnection(blogAddress, controller);
        }
      }, 30000);

      // Clean up on close
      request.signal.addEventListener('abort', () => {
        clearInterval(keepAlive);
        removeSSEConnection(blogAddress, controller);
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
  } catch (error) {
    console.error('SSE endpoint error:', error);
    return new Response("Internal Server Error", { status: 500 });
  }
}