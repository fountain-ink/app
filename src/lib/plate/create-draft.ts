import { getRandomUid } from "@/lib/get-random-uid";
import * as Y from "yjs";
import { isGuestUser } from "../auth/is-guest-user";
import { defaultContent } from "./default-content";
import { slateToDeterministicYjsState } from "@udecode/plate-yjs";

type CreateDraftOptions = {
  initialContent?: any;
  documentId?: string;
  isGuest?: boolean;
  publishedId?: string; // ID of the original published post when editing
  collaborative?: boolean;
};

/**
 * Creates a new draft with the specified content
 * @param options.initialContent Optional initial content for the draft. If not provided, uses default content.
 * @param options.documentId Optional document ID. If not provided, generates a random UID.
 * @param options.isGuest Optional flag to indicate if user is a guest. Affects default content if initialContent not provided.
 * @param options.publishedId Optional ID of the original published post when creating a draft from an existing post.
 * @returns Object containing the documentId of the created draft
 * @throws Error if the draft creation fails
 */
export async function createDraft(options: CreateDraftOptions = {}) {
  const {
    initialContent,
    documentId = getRandomUid(),
    isGuest = isGuestUser(),
    publishedId,
    collaborative = false,
  } = options;

  const contentToUse = initialContent || defaultContent;

  let yDocBase64: string | undefined;
  if (collaborative) {
    const yDoc = await generateYDoc(documentId, contentToUse);
    const yDocBinary = Y.encodeStateAsUpdate(yDoc);
    yDocBase64 = Buffer.from(yDocBinary).toString("base64");
  }

  const response = await fetch("/api/drafts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      documentId,
      yDocBase64,
      contentJson: contentToUse,
      publishedId,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create draft");
  }

  const result = await response.json();
  return result;
}

/**
 * Generates a Yjs document from the given content
 * @param content The content to generate the Yjs document from
 * @returns A Yjs document
 */
const generateYDoc = async (documentId: string, content: any) => {
  const yDoc = new Y.Doc();
  const initialDelta = await slateToDeterministicYjsState(documentId, content);

  yDoc.transact(() => {
    Y.applyUpdate(yDoc, initialDelta);
  });

  // console.log("yDoc", yDoc);
  // const sharedRoot = yDoc.get("content", Y.XmlText);
  // const insertDelta = slateNodesToInsertDelta(content);
  // console.log("insertDelta", insertDelta);
  // console.log("initialDelta", initialDelta);
  //sharedRoot.applyDelta(insertDelta as any);

  return yDoc;
};
