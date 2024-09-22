import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown/lib/ast-to-react";
import remarkGfm from "remark-gfm";
// import { CommunityHandle } from "./communities/CommunityHandle";
import { getBaseUrl } from "@/lib/get-base-url";
import { UserLazyHandle } from "../user/user-lazy-handle";

const BASE_URL = getBaseUrl();

const Markdown: React.FC<{ content: string }> = ({ content }) => {
  const processedText = replaceHandles(parseLinks(content));
  return (
    <ReactMarkdown
      className="prose dark:prose-invert prose-p:m-0 prose-p:inline 
        prose-ul:m-0 prose-h2:m-0 prose-h1:m-0 prose-li:m-0 prose-li:whitespace-normal prose-p:whitespace-normal
        prose-ul:leading-4 prose-ol:leading-4 prose-ol:m-0"
      remarkPlugins={[remarkGfm]}
      components={{
        h1: "h2",
        a: CustomLink,
      }}
    >
      {processedText}
    </ReactMarkdown>
  );
};

const replaceHandles = (content: string): string => {
  if (!content) return content;
  const userHandleRegex = /(?<!\/)@[\w^\/]+(?!\/)/g;
  const communityHandleRegex = /(?<!\S)\/\w+(?!\S)/g;
  return content
    .replace(userHandleRegex, (match) => {
      const parts = match.slice(1).split("/");
      const handle = parts.length > 1 ? parts[1] : parts[0];
      return `${BASE_URL}u/${handle}`;
    })
    .replace(communityHandleRegex, (match) => `${BASE_URL}c${match}`);
};

const parseLinks = (content: string): string => {
  const linkRegex = /(https?:\/\/\S+)/gi;
  return content.replace(linkRegex, (match) => {
    const linkWithoutProtocol = match.replace(/^https?:\/\//, '');
    return `[${linkWithoutProtocol}](${match})`;
  });
};

const CustomLink: Components["a"] = ({ node, ...props }) => {
  const { href, children } = props;
  if (href?.startsWith(BASE_URL)) {
    if (href.startsWith(`${BASE_URL}u/`)) {
      return <UserLazyHandle handle={href.split("/u/")[1] || ""} />;
    }
    // if (href.startsWith(`${BASE_URL}c/`)) {
    //   return <CommunityHandle handle={href.split("/c/")[1]} />;
    // }
  }
  return <a {...props}>{children}</a>;
};

export default Markdown;