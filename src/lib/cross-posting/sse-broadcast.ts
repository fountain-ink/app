// Store active SSE connections per blog
const connections = new Map<string, Set<ReadableStreamDefaultController>>();

export function addSSEConnection(blogAddress: string, controller: ReadableStreamDefaultController) {
  if (!connections.has(blogAddress)) {
    connections.set(blogAddress, new Set());
  }
  connections.get(blogAddress)!.add(controller);
}

export function removeSSEConnection(blogAddress: string, controller: ReadableStreamDefaultController) {
  connections.get(blogAddress)?.delete(controller);
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