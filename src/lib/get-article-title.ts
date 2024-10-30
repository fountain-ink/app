interface ArticleMetadata {
  title: string;
  subtitle: string;
  coverImage: string | null;
}

export const extractMetadata = (content: string | undefined): ArticleMetadata => {
  if (!content) {
    return {
      title: "Untitled",
      subtitle: "",
      coverImage: null,
    };
  }
  const contentJson = JSON.parse(content);

  if (!contentJson?.content || !Array.isArray(contentJson.content)) {
    return {
      title: "Untitled",
      subtitle: "",
      coverImage: null,
    };
  }

  const titleNode = contentJson.content.find(
    (node: any) => node.type === "title" || (node.type === "heading" && node.attrs?.level === 1),
  );
  const subtitleNode = contentJson.content.find(
    (node: any) => node.type === "subtitle" || (node.type === "heading" && node.attrs?.level === 2),
  );
  const imageNode = contentJson.content.find((node: any) => node.type === "image");

  // console.log(titleNode.content?.[0]?.text);
  return {
    title: titleNode ? titleNode.content?.[0]?.text ?? "Untitled" : "Untitled",
    subtitle: subtitleNode ? subtitleNode.content?.[0]?.text ?? "" : "",
    coverImage: imageNode?.attrs?.src ?? null,
  };
};
