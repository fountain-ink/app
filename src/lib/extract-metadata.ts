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
  images: string[];
}

export const extractMetadata = (content?: ContentNode[]): ArticleMetadata => {
  if (!content || !Array.isArray(content)) {
    return {
      title: null,
      subtitle: null,
      coverUrl: null,
      images: [],
    };
  }

  const titleNode = content.find((node) => node.type === "title");
  const subtitleNode = content.find((node) => node.type === "subtitle");
  const imageNode = content.find((node) => node.type === "img");
  const imageNodes = content.filter((node) => node.type === "img");
  const imageUrls = imageNodes.map((node) => node.url).filter(Boolean) as string[];

  const extractText = (node: ContentNode | undefined): string => {
    if (!node || !Array.isArray(node.children) || node.children.length === 0) {
      return "";
    }
    return node.children[0]?.text ?? "";
  };

  return {
    title: extractText(titleNode),
    subtitle: extractText(subtitleNode),
    coverUrl: imageNode?.url ?? null,
    images: imageUrls,
  };
};
