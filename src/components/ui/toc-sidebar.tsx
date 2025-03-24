"use client";

import { cn } from "@udecode/cn";
import { type TocSideBarProps, useTocSideBar, useTocSideBarState } from "@udecode/plate-heading/react";
import { cva } from "class-variance-authority";

import { inter } from "@/styles/google-fonts";
import { Button } from "./button";
import { popoverVariants } from "./popover";

const tocSidebarButtonVariants = cva(
  "block h-auto w-full rounded-sm p-0 text-left hover:bg-transparent overflow-visible text-xs pointer-events-auto cursor-pointer",
  {
    variants: {
      active: {
        false: "text-muted-foreground hover:text-foreground",
        true: "text-accent-foreground hover:text-accent-foreground",
      },
      depth: {
        1: "pl-0",
        2: "pl-3",
        3: "pl-6",
      },
    },
  },
);

export const TocSidebar = ({
  className,
  maxShowCount = 20,
  ...props
}: TocSideBarProps & { className?: string; maxShowCount?: number }) => {
  const state = useTocSideBarState({
    ...props,
  });
  const { activeContentId, headingList, open } = state;
  const { navProps } = useTocSideBar(state);

  return (
    <div className={cn("fixed left-0 top-0 z-[5]", className)}>
      <div className={cn("group absolute left-0 top-0 z-10 max-h-fit")}>
        <div className="relative z-10 mr-2.5 flex flex-col justify-center pb-3 pr-2">
          <div className={cn("flex flex-col gap-3 pb-3 pl-5")}>
            {headingList.slice(0, maxShowCount).map((item) => {
              return (
                <div key={item.id}>
                  <div
                    className={cn(
                      "h-0.5 rounded-xs bg-primary/20",
                      // activeContentId === item.id && "bg-primary",
                    )}
                    style={{
                      marginRight: `${4 * (item.depth - 1)}px`,
                      width: `${16 - 4 * (item.depth - 1)}px`,
                    }}
                  />
                </div>
              );
            })}
          </div>

          <nav
            className={cn(
              "absolute -top-2.5 left-0 px-2.5 transition-all duration-300",
              "pointer-events-none -translate-x-[50px] opacity-0",
              "group-hover:pointer-events-auto group-hover:translate-x-0 group-hover:opacity-100",
              "touch:opacity-100 touch:translate-x-0 touch:pointer-events-auto select-none",
              headingList.length === 0 && "hidden",
              inter.className,
            )}
            aria-label="Table of contents"
            {...(navProps as any)}
          >
            <div
              id="toc_wrap"
              className={cn(popoverVariants(), "-mr-2.5 max-h-fit w-[242px] scroll-m-1 overflow-auto rounded-sm p-4")}
            >
              <div className="font-semibold text-sm select-none">Table of contents</div>
              <div className={cn("relative z-10 p-2", !open && "hidden")}>
                {headingList.map((item, index) => {
                  const isActive = activeContentId ? activeContentId === item.id : index === 0;

                  return (
                    <Button
                      id={isActive ? "toc_item_active" : "toc_item"}
                      key={`${item.id}-${index}`}
                      variant="ghost"
                      className={cn(
                        tocSidebarButtonVariants({
                          active: false,
                          depth: item.depth as any,
                        }),
                      )}
                      onClick={(e) => {
                        e.preventDefault();
                        const element = document.getElementById(item.id);
                        if (element) {
                          const elementPosition = element.getBoundingClientRect().top;
                          const offsetPosition = elementPosition + window.scrollY - 50;
                          window.scrollTo({
                            top: offsetPosition,
                            behavior: "smooth",
                          });
                        }
                      }}
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
