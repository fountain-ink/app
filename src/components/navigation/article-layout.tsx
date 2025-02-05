import "@/styles/article.css";
import { SmoothScroll } from "../misc/smooth-scroll";

export const ArticleLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SmoothScroll>
      <article className="article relative pt-20 w-full" data-plate-selectable>
          {children}
      </article>
    </SmoothScroll>
  );
};
