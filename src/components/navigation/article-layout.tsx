import "@/styles/article.css";
import { SmoothScroll } from "../misc/smooth-scroll";

export const ArticleLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SmoothScroll>
      <article className="article relative pt-4 sm:pt-10 md:pt-16 w-full" data-plate-selectable>
        {children}
      </article>
    </SmoothScroll>
  );
};
