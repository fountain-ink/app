"use client";

import { cn, withRef } from "@udecode/cn";

import { Calendar } from "./calendar";
import { PlateElement } from "@udecode/plate/react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export const DateElement = withRef<typeof PlateElement>(({ children, className, ...props }, ref) => {
  const { editor, element } = props;

  return (
    <PlateElement ref={ref} className={cn("inline-block", className)} {...props}>
      <Popover>
        <PopoverTrigger asChild>
          <span
            className={cn("w-fit cursor-pointer rounded-[8px] bg-muted px-2 py-1 text-muted-foreground")}
            contentEditable={false}
          >
            {element.date ? (
              (() => {
                const today = new Date();
                const elementDate = new Date(element.date as string);
                const isToday =
                  elementDate.getDate() === today.getDate() &&
                  elementDate.getMonth() === today.getMonth() &&
                  elementDate.getFullYear() === today.getFullYear();

                const isYesterday =
                  new Date(today.setDate(today.getDate() - 1)).toDateString() === elementDate.toDateString();
                const isTomorrow =
                  new Date(today.setDate(today.getDate() + 2)).toDateString() === elementDate.toDateString();

                if (isToday) return "Today";
                if (isYesterday) return "Yesterday";
                if (isTomorrow) return "Tomorrow";

                return elementDate.toLocaleDateString(undefined, {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                });
              })()
            ) : (
              <span>Pick a date</span>
            )}
          </span>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            selected={new Date(element.date as string)}
            onSelect={(date) => {
              if (!date) return;

              editor.tf.setNodes({ date: date.toDateString() }, { at: editor.api.findPath(element) });
            }}
            mode="single"
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {children}
    </PlateElement>
  );
});
