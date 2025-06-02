import { getRandomUid } from "@/lib/get-random-uid";
import * as Y from "yjs";
import { isGuestUser } from "../auth/is-guest-user"; // Assuming this is used, else remove
import { defaultContent } from "./default-content";
import { slateToDeterministicYjsState } from "@udecode/plate-yjs";

type CreateDraftOptions = {
  initialContent?: any;
  documentId?: string;
  isGuest?: boolean; // Assuming this is used, else remove
  publishedId?: string;
  isCollaborative?: boolean;
  yDocBase64?: string;
};

export const generateYDoc = async (documentId: string, content: any) => {
  const yDoc = new Y.Doc();
  const initialDelta = await slateToDeterministicYjsState(documentId, content);
  yDoc.transact(() => {
    Y.applyUpdate(yDoc, initialDelta);
  });
  return yDoc;
};

export async function createDraft(options: CreateDraftOptions = {}) {
  const {
    initialContent,
    documentId = getRandomUid(),
    publishedId,
    isCollaborative: optionsIsCollaborative = false
    // isGuest is not used in the new logic, consider removing if not used elsewhere
  } = options;

  const contentToUse = initialContent || defaultContent;
  let yDocBase64ToUse = options.yDocBase64;

  const body: {
    documentId: string;
    contentJson: any;
    publishedId?: string;
    yDocBase64?: string;
  } = {
    documentId,
    contentJson: contentToUse,
    publishedId,
  };

  if (optionsIsCollaborative && !yDocBase64ToUse) {
    const yDoc = await generateYDoc(documentId, contentToUse);
    const yDocBinary = Y.encodeStateAsUpdate(yDoc);
    yDocBase64ToUse = Buffer.from(yDocBinary).toString("base64");
  }

  if (yDocBase64ToUse) {
    body.yDocBase64 = yDocBase64ToUse;
  }

  const response = await fetch("/api/drafts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Failed to create draft:", response.status, errorBody);
    throw new Error(`Failed to create draft: ${response.status} ${errorBody}`);
  }

  return await response.json();
}
