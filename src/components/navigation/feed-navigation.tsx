import { SlideNav } from "@/components/ui/slide-tabs";

export const FeedNavigation = () => {
  return (
    <div className="p-4 pb-0 font-[family-name:var(--title-font)] border-b border-border w-full max-w-3xl">
      <SlideNav
        items={[
          {
            href: "/home",
            label: "Latest",
          },
          {
            href: "/curated",
            label: "Curated",
          },
          {
            href: "/bookmarks",
            label: "Bookmarks",
          },
        ]}
        className="w-fit"
      />
    </div>
  );
}; 