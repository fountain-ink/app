import "@/styles/article.css";
import { SmoothScroll } from "../smooth-scroll";

export const ArticleLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <SmoothScroll>
      <article
        className="overflow-y-auto w-screen h-screen article relative [&_.slate-selection-area]:border [&_.slate-selection-area]:border-primary [&_.slate-selection-area]:bg-primary/10 "
        data-plate-selectable="true"
        id="scroll_container"
      >
        {children}
      </article>
    </SmoothScroll>
  );
};
