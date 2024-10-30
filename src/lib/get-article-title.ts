import type { JSONContent } from "novel";

interface ArticleMetadata {
  title: string;
  subtitle: string;
  coverImage: string | null;
}

export const extractMetadata = (content: JSONContent | undefined): ArticleMetadata => {
  if (!content) {
    return {
      title: "Untitled",
      subtitle: "",
      coverImage: null,
    };
  }

  const contentJson = content.content;

  if (!contentJson || !Array.isArray(contentJson)) {
    return {
      title: "Untitled",
      subtitle: "",
      coverImage: null,
    };
  }

  const titleNode = contentJson.find(
    (node: any) => node.type === "title" || (node.type === "heading" && node.attrs?.level === 1),
  );
  const subtitleNode = contentJson.find(
    (node: any) => node.type === "subtitle" || (node.type === "heading" && node.attrs?.level === 2),
  );
  const imageNode = contentJson.find((node: any) => node.type === "image");

  return {
    title: titleNode ? titleNode.content?.[0]?.text ?? "Untitled" : "Untitled",
    subtitle: subtitleNode ? subtitleNode.content?.[0]?.text ?? "" : "",
    coverImage: imageNode?.attrs?.src ?? null,
  };
};
