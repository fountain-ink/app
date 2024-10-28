interface ArticleMetadata {
  title: string;
  subtitle: string;
  coverImage: string | null;
}

export const extractMetadata = (contentJson: any): ArticleMetadata => {
  if (!contentJson?.content || !Array.isArray(contentJson.content)) {
    return {
      title: "Untitled",
      subtitle: "",
      coverImage: null,
    };
  }

  const titleNode = contentJson.content.find((node: any) => node.type === "title");
  const subtitleNode = contentJson.content.find((node: any) => node.type === "subtitle");
  const imageNode = contentJson.content.find((node: any) => node.type === "image");

  // console.log(titleNode.content?.[0]?.text);
  return {
    title: titleNode ? titleNode.content?.[0]?.text ?? "Untitled" : "Untitled",
    subtitle: subtitleNode ? subtitleNode.content?.[0]?.text ?? "" : "",
    coverImage: imageNode?.attrs?.src ?? null,
  };
};
