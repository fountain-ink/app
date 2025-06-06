"use client";

import { faker } from "@faker-js/faker";
import { useChat as useBaseChat } from "ai/react";

export const useChat = () => {
  return useBaseChat({
    id: "editor",
    api: "/api/ai/command",
    fetch: (async (input, init) => {
      const res = await fetch(input, init);

      if (!res.ok) {
        // Mock the API response. Remove it when you implement the route /api/ai/command
        await new Promise((resolve) => setTimeout(resolve, 400));

        const stream = fakeStreamText();

        return new Response(stream, {
          headers: {
            Connection: "keep-alive",
            "Content-Type": "text/plain",
          },
        });
      }

      return res;
    }) as typeof fetch,
  });
};

// Used for testing. Remove it after implementing useChat api.
const fakeStreamText = ({
  chunkCount = 10,
  streamProtocol = "data",
}: {
  chunkCount?: number;
  streamProtocol?: "data" | "text";
} = {}) => {
  const chunks = Array.from({ length: chunkCount }, () => ({
    delay: faker.datatype.number({ max: 150, min: 50 }),
    texts: `${faker.lorem.words(3)} `,
  }));
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      for (const chunk of chunks) {
        await new Promise((resolve) => setTimeout(resolve, chunk.delay));

        if (streamProtocol === "text") {
          controller.enqueue(encoder.encode(chunk.texts));
        } else {
          controller.enqueue(encoder.encode(`0:${JSON.stringify(chunk.texts)}\n`));
        }
      }

      if (streamProtocol === "data") {
        controller.enqueue(
          `d:{"finishReason":"stop","usage":{"promptTokens":0,"completionTokens":${chunks.length}}}\n`,
        );
      }

      controller.close();
    },
  });
};
