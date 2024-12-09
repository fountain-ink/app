import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
// import { CommunityHandle } from "./communities/CommunityHandle";

import { getBaseUrl } from "@/lib/get-base-url";
import { proseClasses } from "@/styles/prose";
import { UserLazyHandle } from "./user/user-lazy-handle";

const BASE_URL = getBaseUrl();

const Markdown: React.FC<{ content: string; proseStyling?: boolean; className?: string }> = ({
  content,
  proseStyling = false,
  className,
}) => {
  const processedText = replaceHandles(parseLinks(content));
  const styles = (proseStyling ? proseClasses : "") + (className ? ` ${className}` : "");
  return (
    <ReactMarkdown
      className={styles}
      remarkPlugins={[remarkGfm]}
      components={{
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
    const linkWithoutProtocol = match.replace(/^https?:\/\//, "");
    return `[${linkWithoutProtocol}](${match})`;
  });
};

const CustomLink: Components["a"] = ({ node, ...props }) => {
  const { href, children } = props;
  if (href?.startsWith(BASE_URL)) {
    if (href.startsWith(`${BASE_URL}`)) {
      return <UserLazyHandle handle={href.split("/u/")[1] || ""} />;
    }
    // if (href.startsWith(`${BASE_URL}c/`)) {
    //   return <CommunityHandle handle={href.split("/c/")[1]} />;
    // }
  }
  return <a {...props}>{children}</a>;
};

export default Markdown;
