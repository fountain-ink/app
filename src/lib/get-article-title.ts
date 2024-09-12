import type { ContentNode } from "./types";

export const extractTitle = (content: any): string => {
  try {
    const firstTextNode = content.content.find(
      (node: ContentNode) =>
        node.type === "heading" || node.type === "paragraph" || node.type === "text" || node.content?.[0]?.text,
    );

    if (firstTextNode) {
      if (firstTextNode.type === "heading" || firstTextNode.type === "paragraph") {
        return firstTextNode.content[0].text;
      }

      const sentence = firstTextNode.content[0].text.split(".")[0];
      return sentence.length > 0 ? `${sentence}.` : "Untitled Draft";
    }

    return "Untitled Draft";
  } catch (error) {
    console.error("Error parsing content:", error);
    return "Untitled Draft";
  }
};
