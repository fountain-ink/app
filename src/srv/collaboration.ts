import { Logger } from "@hocuspocus/extension-logger";
import { Server } from "@hocuspocus/server";
import { slateNodesToInsertDelta } from "@slate-yjs/core";
import * as Y from "yjs";

const initialValue = [
  {
    type: "h1",
    children: [{ text: "" }],
  },
];

const server = Server.configure({
  port: 1234,
  address: "0.0.0.0",

  extensions: [new Logger()],

  async onLoadDocument(data) {
    if (data.document.isEmpty("content")) {
      const insertDelta = slateNodesToInsertDelta(initialValue);
      const sharedRoot = data.document.get("content", Y.XmlText);
      sharedRoot.applyDelta(insertDelta);
    }

    return data.document;
  },
});

server.enableMessageLogging();
server.listen();
