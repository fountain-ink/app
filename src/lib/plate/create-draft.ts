import { getRandomUid } from "@/lib/get-random-uid";
import { slateNodesToInsertDelta } from "@slate-yjs/core";
import * as Y from "yjs";
import { isGuestUser } from "../auth/is-guest-user";
import { TITLE_KEYS } from "@/components/editor/plugins/title-plugin";
import { ParagraphPlugin } from "@udecode/plate-core/react";

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
    id: "guest-paragraph",
    type: ParagraphPlugin.key,
    children: [
      {
        text: "Welcome to Fountain! When you want to save the draft or publish your article, login to continue. Enjoy!",
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
];

type CreateDraftOptions = {
  initialContent?: any;
  documentId?: string;
  isGuest?: boolean;
  publishedId?: string; // ID of the original published post when editing
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
    publishedId
  } = options;

  const contentToUse = initialContent || (isGuest ? defaultGuestContent : defaultContent);

  const yDoc = generateYDoc(contentToUse);
  const yDocBinary = Y.encodeStateAsUpdate(yDoc);
  const yDocBase64 = Buffer.from(yDocBinary).toString('base64');

  const response = await fetch("/api/drafts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      documentId,
      contentJson: contentToUse,
      yDocBase64,
      publishedId
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create draft");
  }

  return { documentId };
}

/**
 * Generates a Yjs document from the given content
 * @param content The content to generate the Yjs document from
 * @returns A Yjs document
 */
const generateYDoc = (content: any) => {
  const yDoc = new Y.Doc();
  const sharedRoot = yDoc.get("content", Y.XmlText);
  const insertDelta = slateNodesToInsertDelta(content);
  sharedRoot.applyDelta(insertDelta);

  return yDoc;
}