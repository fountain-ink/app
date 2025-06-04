import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
// import { CommunityHandle } from "./communities/CommunityHandle";

import { getBaseUrl } from "@/lib/get-base-url";
import { proseClasses } from "@/styles/prose";
import { UserLazyUsername } from "../user/user-lazy-username";

const BASE_URL = getBaseUrl();

const Markdown: React.FC<{ content: string; proseStyling?: boolean; className?: string }> = ({
  content,
  proseStyling = false,
  className,
}) => {
  const processedText = replaceUsernames(parseLinks(content));
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

const replaceUsernames = (content: string): string => {
  if (!content) return content;
  const usernameRegex = /(?<!\/)@[a-zA-Z0-9_]+/g;
  const communityRegex = /(?<!\S)\/\w+(?!\S)/g;
  return content
    .replace(usernameRegex, (match) => {
      const handle = match.slice(1);
      return `[@${handle}](${BASE_URL}u/${handle})`;
    })
    .replace(communityRegex, (match) => `${BASE_URL}c${match}`);
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
    if (href.startsWith(`${BASE_URL}u/`)) {
      const userPath = href.split("/u/")[1];
      if (userPath) {
        const decodedPath = decodeURIComponent(userPath);
        const username = decodedPath.match(/^[a-zA-Z0-9_]+/)?.[0] || "";
        if (username) {
          return <UserLazyUsername username={username} />;
        }
      }
    }
    // if (href.startsWith(`${BASE_URL}c/`)) {
    //   return <CommunityHandle handle={href.split("/c/")[1]} />;
    // }
  }
  return <a {...props}>{children}</a>;
};

export default Markdown;
