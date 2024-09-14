import type { ContentNode } from "./types";

export const extractTitle = (content: any): string => {
  try {
    if (!content || !content.content || !Array.isArray(content.content)) {
      return "Untitled";
    }

    const firstTextNode = content.content.find((node: ContentNode) => {
      return (
        node.type === "heading" ||
        node.type === "paragraph" ||
        node.type === "text" ||
        (node.content && Array.isArray(node.content) && node.content[0]?.text)
      );
    });

    if (!firstTextNode) {
      return "Untitled";
    }

    if (firstTextNode.type === "heading" || firstTextNode.type === "paragraph") {
      return firstTextNode.content?.[0]?.text || "Untitled";
    }

    if (firstTextNode.type === "text") {
      const sentence = firstTextNode.text?.split(".")[0] || "";
      return sentence.length > 0 ? `${sentence}.` : "Untitled";
    }

    if (firstTextNode.content && Array.isArray(firstTextNode.content)) {
      const sentence = firstTextNode.content[0]?.text?.split(".")[0] || "";
      return sentence.length > 0 ? `${sentence}.` : "Untitled";
    }

    return "Untitled";
  } catch (error) {
    console.error("Error parsing content:", error);
    return "Untitled";
  }
};
