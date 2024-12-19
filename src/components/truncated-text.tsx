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
      className={`truncated-text ${isTruncated ? "line-clamp-3" : "line-clamp-none"}`}
      onKeyDown={() => setIsCollapsed(!isCollapsed)}
      onClick={() => setIsCollapsed(!isCollapsed)}
    >
      {isMarkdown ? (
        <div className="not-article p-0 mt-0 p:mb-0 m-0">
          <Markdown content={truncatedText + ellipsis} />
        </div>
      ) : (
        truncatedText + ellipsis
      )}
    </span>
  );
};
