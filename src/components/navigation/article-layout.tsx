import "@/styles/article.css";
import { SmoothScroll } from "../misc/smooth-scroll";

export const ArticleLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <SmoothScroll>
      <div className="h-[calc(3rem)]" />
      <article
        className="overflow-y-auto w-screen h-[calc(100lvh-3rem)] article relative pt-10 [&_.slate-selection-area]:border [&_.slate-selection-area]:border-primary [&_.slate-selection-area]:bg-primary/10 "
        data-plate-selectable="true"
        id="scroll_container"
      >
        {children}
      </article>
    </SmoothScroll>
  );
};
