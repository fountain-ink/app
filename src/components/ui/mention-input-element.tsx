"use client";

import { cn, withRef } from "@udecode/cn";
import { PlateElement } from "@udecode/plate/react";
import { getMentionOnSelectItem } from "@udecode/plate-mention";
import { useState } from "react";
import { UserSearch } from "../user/user-search";
import { InlineCombobox, InlineComboboxContent, InlineComboboxEmpty, InlineComboboxInput } from "./inline-combobox";

const onSelectItem = getMentionOnSelectItem();

export const MentionInputElement = withRef<typeof PlateElement>(({ className, ...props }, ref) => {
  const { children, editor, element } = props;
  const [search, setSearch] = useState("");

  return (
    <PlateElement ref={ref} as="span" data-slate-value={element.value} {...props}>
      <InlineCombobox value={search} element={element} setValue={setSearch} showTrigger={true} trigger="@">
        <span className={cn("inline-block align-baseline", className)}>
          <InlineComboboxInput />
        </span>

        <InlineComboboxContent className="my-1.5">
          {!search ? (
            <InlineComboboxEmpty>Type to search...</InlineComboboxEmpty>
          ) : (
            <UserSearch
              query={search}
              maxResults={10}
              onResultsChange={(results) => {
                // results will be an array with exactly one item - the clicked item
                if (results[0]) {
                  onSelectItem(editor, results[0], search);
                }
              }}
            />
          )}
        </InlineComboboxContent>
      </InlineCombobox>

      {children}
    </PlateElement>
  );
});
