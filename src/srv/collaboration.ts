import { getAuthWithToken } from "@/lib/get-auth-clients";
import { getDatabase } from "@/lib/get-database";
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

const db = getDatabase();

const server = Server.configure({
  port: 4444,
  address: "0.0.0.0",
  extensions: [
    new Logger(),
    new Database({
      fetch: async ({ documentName, document }) => {
        const { data: response } = await db.from("drafts").select().eq("documentId", documentName).single();

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

        const { data: response, error } = await db
          .from("drafts")
          .update({
            yDoc,
            contentJson,
            updatedAt: new Date(),
          })
          .eq("documentId", documentName);

        if (error) {
          console.error(`Error upserting document: ${error.message}`);
        }
      },
    }),
  ],

  async onAuthenticate(data) {
    try {
      await getAuthWithToken(data.token);
    } catch (error) {
      console.error("Error authenticating, dropping connection");
      throw error;
    }
  },
});

server.enableMessageLogging();
server.listen();
