"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { useCallback } from "react";

export const BlogTagNavigation = ({
  tags,
  username
}: {
  tags: Array<{ tag: string; count: number }>;
  username: string;
}) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const currentTag = searchParams.get("tag");

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null || value === "") {
        params.delete(name);
      } else {
        params.set(name, value);
      }
      return params.toString();
    },
    [searchParams]
  );

  const handleTagClick = (tag: string) => {
    const query = tag === currentTag ? "" : tag;
    router.push(`${pathname}?${createQueryString("tag", query)}`);
  };

  if (!tags || tags.length === 0) return null;

  const sortedTags = [...tags]
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
    .slice(0, 15);

  return (
    <div className="flex flex-row gap-2 flex-wrap font-[family-name:--title-font] justify-center">
      <Button
        variant={!currentTag ? "ghost2" : "ghost"}
        onClick={() => handleTagClick("")}
        className="text-sm"
      >
        All
      </Button>

      {sortedTags.map((tag) => (
        <Button
          key={tag.tag}
          variant={currentTag === tag.tag ? "ghost2" : "ghost"}
          onClick={() => handleTagClick(tag.tag)}
          className="text-sm"
        >
          {tag.tag} {tag.count > 0 && <span className="text-xs opacity-70">({tag.count})</span>}
        </Button>
      ))}
    </div>
  );
}; 