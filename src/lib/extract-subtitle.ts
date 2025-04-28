export const extractSubtitle = (contentJson?: string): string => {
  if (!contentJson) return "";
  try {
    const parsed = JSON.parse(contentJson);
    const paragraphs = [];
    for (const node of parsed) {
      if (node.type === "p" && node.children?.[0]?.text?.trim()) {
        paragraphs.push(node.children[0].text.trim());
        if (paragraphs.length >= 5) break;
      }
    }

    if (paragraphs.length === 0) return "";
    return paragraphs.join(" ");
  } catch (e) {
    console.error("Failed to parse contentJson:", e);
    return "";
  }
}; 