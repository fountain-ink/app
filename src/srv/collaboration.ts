import { env } from "@/env";
import { getTokenClaims } from "@/lib/auth/get-token-claims";
import { verifyToken } from "@/lib/auth/verify-token";
import { extractMetadata } from "@/lib/extract-metadata";
import { Json } from "@/lib/db/database";
import { createServiceClient } from "@/lib/db/service";
import { Database } from "@hocuspocus/extension-database";
import { Logger } from "@hocuspocus/extension-logger";
import { Server } from "@hocuspocus/server";
import { slateNodesToInsertDelta, yTextToSlateElement } from "@slate-yjs/core";
import * as Y from "yjs";
import { TITLE_KEYS } from "@/components/editor/plugins/title-plugin";
import { ParagraphPlugin } from "@udecode/plate/react";

export const defaultGuestContent: any = [
  {
    type: TITLE_KEYS.title,
    children: [
      {
        text: "",
      },
    ],
  },
  {
    type: TITLE_KEYS.subtitle,
    children: [
      {
        text: "",
      },
    ],
  },
  {
    type: "img",
    width: "wide",
    children: [
      {
        text: "",
      },
    ],
  },
  {
    type: ParagraphPlugin.key,
    children: [
      {
        text: "Welcome to Fountain! When you want to save the draft or publish your article, login to continue. Enjoy!",
      },
    ],
  },
  {
    type: ParagraphPlugin.key,
    children: [
      {
        text: "",
      },
    ],
  },
];

export const defaultContent: any = [
  {
    type: TITLE_KEYS.title,
    children: [
      {
        text: "",
      },
    ],
  },
  {
    type: TITLE_KEYS.subtitle,
    children: [
      {
        text: "",
      },
    ],
  },
  {
    type: "img",
    width: "wide",
    children: [
      {
        text: "",
      },
    ],
  },
  {
    type: ParagraphPlugin.key,
    children: [
      {
        text: "",
      },
    ],
  },
];

const db = await createServiceClient();

const server = Server.configure({
  port: 4444,
  address: "0.0.0.0",
  extensions: [
    new Logger(),
    new Database({
      fetch: async ({ documentName, document, context, instance, requestHeaders, requestParameters }) => {
        let retries = 3;
        let delay = 300;
        let response = null;
        let error = null;

        while (retries > 0) {
          const result = await db.from("drafts").select().eq("documentId", documentName).single();
          response = result.data;
          error = result.error;

          if (response) {
            break;
          }

          if (error) {
            console.warn(`Error fetching document: ${error.message}, retries left: ${retries}`);
          } else {
            console.warn(`Document ${documentName} not found, retries left: ${retries}`);
          }

          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // Exponential backoff
          retries--;
        }

        const author = response?.author;
        const isGuest = author?.startsWith("guest-");

        if (!response) {
          console.error(`Document ${documentName} not found in database after multiple attempts`);

          const insertDelta = slateNodesToInsertDelta(defaultContent);
          const sharedRoot = document.get("content", Y.XmlText);
          sharedRoot.delete(0, sharedRoot.length);
          sharedRoot.applyDelta(insertDelta);
          const encoded = Y.encodeStateAsUpdate(document);

          return encoded;
        }

        if (!response.yDoc) {
          console.warn(`Document ${documentName} has no yDoc, creating default`);
          const insertDelta = isGuest ? slateNodesToInsertDelta(defaultGuestContent) : slateNodesToInsertDelta(defaultContent);
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
        const { title, subtitle, coverUrl } = extractMetadata(contentJson as any);

        const { data: response, error } = await db
          .from("drafts")
          .update({
            yDoc,
            title: title ?? undefined,
            subtitle,
            coverUrl,
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
