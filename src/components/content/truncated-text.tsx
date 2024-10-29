"use client";

import { useState } from "react";
import Markdown from "./markdown";

export const TruncatedText = ({
  text,
  maxLength,
  isMarkdown = true,
}: {
  text: string;
  maxLength: number;
  isMarkdown?: boolean;
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  if (!text) return null;
  const isTruncated = isCollapsed && text.length > maxLength;
  const truncatedText = isCollapsed ? text.substring(0, maxLength) : text;
  const ellipsis = isTruncated ? "..." : "";

  return (
    <span
      className={isTruncated ? "line-clamp-3" : "line-clamp-none"}
      onKeyDown={() => setIsCollapsed(!isCollapsed)}
      onClick={() => setIsCollapsed(!isCollapsed)}
    >
      {isMarkdown ? <Markdown content={truncatedText + ellipsis} /> : truncatedText + ellipsis}
    </span>
  );
};
