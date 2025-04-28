interface ContentNode {
  type: string;
  children: Array<{ text: string }>;
  id: string;
  url?: string;
  width?: string;
}

interface ArticleMetadata {
  title: string | null;
  subtitle: string | null;
  coverUrl: string | null;
}

export const extractMetadata = (content?: ContentNode[]): ArticleMetadata => {
  if (!content || !Array.isArray(content)) {
    return {
      title: null,
      subtitle: null,
      coverUrl: null,
    };
  }

  const titleNode = content.find((node) => node.type === "title");
  const subtitleNode = content.find((node) => node.type === "subtitle");
  const imageNode = content.find((node) => node.type === "img");

  const extractText = (node: ContentNode | undefined): string => {
    if (!node || !Array.isArray(node.children) || node.children.length === 0) {
      return "";
    }
    return node.children[0]?.text ?? "";
  };

  return {
    title: extractText(titleNode) || "Untitled",
    subtitle: extractText(subtitleNode),
    coverUrl: imageNode?.url ?? null,
  };
};
