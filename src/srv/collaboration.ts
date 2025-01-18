import { env } from "@/env";
import { getTokenClaims } from "@/lib/auth/get-token-claims";
import { verifyToken } from "@/lib/auth/verify-token";
import { extractMetadata } from "@/lib/get-article-title";
import { Json } from "@/lib/supabase/database";
import { createServiceClient } from "@/lib/supabase/service";
import { Database } from "@hocuspocus/extension-database";
import { Logger } from "@hocuspocus/extension-logger";
import { Server } from "@hocuspocus/server";
import { slateNodesToInsertDelta, yTextToSlateElement } from "@slate-yjs/core";
import * as Y from "yjs";

const initialValue = [
  {
    type: "h1",
    children: [{ text: "" }],
  },
  {
    type: "h2",
    children: [{ text: "" }],
  },
  {
    type: "img",
    children: [{ text: "" }],
    width: "wide",
  },
  {
    type: "p",
    children: [{ text: "" }],
  },
];

const db = await createServiceClient();

const server = Server.configure({
  port: 4444,
  address: "0.0.0.0",
  extensions: [
    new Logger(),
    new Database({
      fetch: async ({ documentName, document }) => {
        const { data: response, error } = await db.from("drafts").select().eq("documentId", documentName).single();

        if (error) {
          console.error(`Error fetching document: ${error.message}`);
        }

        if (!response || !response.yDoc) {
          const insertDelta = slateNodesToInsertDelta(initialValue);
          const sharedRoot = document.get("content", Y.XmlText);
          sharedRoot.delete(0, sharedRoot.length);
          sharedRoot.applyDelta(insertDelta);
          const encoded = Y.encodeStateAsUpdate(document);

          return encoded;
        }

        const ydoc = Buffer.from(response.yDoc.slice(2), "hex");

        return ydoc;
      },

      store: async ({ documentName, state, document }) => {
        const yDoc = `\\x${state.toString("hex")}`;
        const contentJson = yTextToSlateElement(document.get("content", Y.XmlText)).children;
        const { title, subtitle } = extractMetadata(contentJson as any);

        const { data: response, error } = await db
          .from("drafts")
          .update({
            yDoc,
            title,
            subtitle,
            contentJson: contentJson as any,
            updatedAt: new Date().toISOString(),
          })
          .eq("documentId", documentName);

        if (error) {
          console.error(`Error updating document: ${error.message}`);
        }
      },
    }),
  ],

  async onAuthenticate(data) {
    const JWT_SECRET = env.SUPABASE_JWT_SECRET;

    try {
      if (!data.token) {
        throw new Error("No authentication token provided");
      }

      if (!verifyToken(data.token, JWT_SECRET)) {
        throw new Error("Invalid authentication token provided");
      }

      const claims = getTokenClaims(data.token);

      if (claims?.role !== "authenticated") {
        throw new Error("Unauthenticated");
      }
    } catch (error) {
      console.error(`Error authenticating, dropping connection. ${error}`);
      throw error;
    }
  },
});

server.enableMessageLogging();
server.listen();
