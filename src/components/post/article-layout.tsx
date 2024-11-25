import "@/styles/article.css";

export const ArticleLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <article
      className="overflow-y-auto w-screen h-screen article relative [&_.slate-selection-area]:border [&_.slate-selection-area]:border-primary [&_.slate-selection-area]:bg-primary/10 "
      id="scroll_container"
      data-plate-selectable="true"
    >
      {children}
    </article>
  );
};
