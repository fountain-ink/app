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

        const { data: response, error } = await db
          .from("drafts")
          .update({
            yDoc,
            contentJson: JSON.stringify(contentJson),
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
    try {
      // const lens = await getLensClientWithToken(data.token);
      // const { handle } = await getUserProfile(lens);
      // const claims = getAuthClaims();
      // console.log(claims);
      console.log(data);
    } catch (error) {
      console.error("Error authenticating, dropping connection");
      throw error;
    }
  },
});

server.enableMessageLogging();
server.listen();
