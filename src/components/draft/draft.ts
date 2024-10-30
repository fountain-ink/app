import type { JSONContent } from "novel";

export type Draft = {
  id: number;
  isLocal: boolean;
  documentId: string;
  authorId: string;
  contentJson: JSONContent;
  updatedAt: string;
  createdAt: string;
};
