import type { UseEmojiPickerType } from "@udecode/plate-emoji/react";
import type { ReactNode } from "react";

export type EmojiPickerSearchBarProps = {
  children: ReactNode;
} & Pick<UseEmojiPickerType, "i18n" | "searchValue" | "setSearch">;

export function EmojiPickerSearchBar({ children, i18n, searchValue, setSearch }: EmojiPickerSearchBarProps) {
  return (
    <div className="flex items-center px-2">
      <div className="relative flex grow items-center">
        <input
          className="block w-full appearance-none rounded-full border-0 bg-muted px-10 py-2 text-sm outline-hidden placeholder:text-muted-foreground focus-visible:outline-hidden"
          value={searchValue}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={i18n.search}
          aria-label="Search"
          autoComplete="off"
          type="text"
        />
        {children}
      </div>
    </div>
  );
}
