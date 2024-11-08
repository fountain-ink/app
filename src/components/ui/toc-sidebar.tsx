"use client";

import { cn } from "@udecode/cn";
import { type TocSideBarProps, useTocSideBar, useTocSideBarState } from "@udecode/plate-heading/react";
import { cva } from "class-variance-authority";

import { Button } from "./button";
import { popoverVariants } from "./popover";

const tocSidebarButtonVariants = cva("block h-auto w-full rounded-sm p-0 text-left", {
  variants: {
    active: {
      false: "text-muted-foreground hover:text-foreground",
      true: "text-brand hover:text-brand",
    },
    depth: {
      3: "pl-0",
      4: "pl-3",
      5: "pl-6",
    },
  },
});

export const TocSideBar = ({
  className,
  maxShowCount = 20,
  ...props
}: TocSideBarProps & { className?: string; maxShowCount?: number }) => {
  const state = useTocSideBarState({
    ...props,
  });
  const { activeContentId, headingList, open } = state;
  const { navProps, onContentClick } = useTocSideBar(state);

  return (
    <div className={cn("sticky left-0 top-0 z-[5]", className)}>
      <div className={cn("group absolute left-0 top-0 z-10 max-h-fit")}>
        <div className="relative z-10 mr-2.5 flex flex-col justify-center pb-3 pr-2">
          <div className={cn("flex flex-col gap-3 pb-3 pl-5")}>
            {headingList.slice(0, maxShowCount).map((item) => (
              <div key={item.id}>
                <div
                  className={cn("h-0.5 rounded-xs bg-primary/20", activeContentId === item.id && "bg-primary")}
                  style={{
                    marginLeft: `${4 * (item.depth - 1)}px`,
                    width: `${16 - 4 * (item.depth - 1)}px`,
                  }}
                />
              </div>
            ))}
          </div>

          <nav
            className={cn(
              "absolute -top-2.5 left-0 px-2.5 transition-all duration-300",
              "pointer-events-none translate-x-[10px] opacity-0",
              "group-hover:pointer-events-auto group-hover:translate-x-0 group-hover:opacity-100",
              "touch:opacity-100 touch:translate-x-0 touch:pointer-events-auto",
              headingList.length === 0 && "hidden",
            )}
            aria-label="Table of contents"
            {...navProps}
          >
            <div
              id="toc_wrap"
              className={cn(popoverVariants(), "-mr-2.5 max-h-fit w-[242px] scroll-m-1 overflow-auto rounded-2xl p-3")}
            >
              <div className={cn("relative z-10 p-1.5", !open && "hidden")}>
                {headingList.map((item, index) => {
                  const isActive = activeContentId ? activeContentId === item.id : index === 0;

                  return (
                    <Button
                      id={isActive ? "toc_item_active" : "toc_item"}
                      key={`${item.id}-${index}`}
                      variant="ghost"
                      className={cn(
                        tocSidebarButtonVariants({
                          active: isActive,
                          depth: item.depth as any,
                        }),
                      )}
                      onClick={(e) => onContentClick(e, item, "smooth")}
                      aria-current={isActive}
                    >
                      <div className="p-1">{item.title}</div>
                    </Button>
                  );
                })}
              </div>
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
};
