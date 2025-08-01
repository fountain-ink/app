import { cn } from "@udecode/cn";
import { type Emoji, EmojiSettings, type GridRow } from "@udecode/plate-emoji";
import type { UseEmojiPickerType } from "@udecode/plate-emoji/react";
import { memo, useCallback } from "react";

export type EmojiButtonProps = {
  emoji: Emoji;
  index: number;
  onMouseOver: (emoji?: Emoji) => void;
  onSelect: (emoji: Emoji) => void;
};

export type EmojiPickerContentProps = Pick<
  UseEmojiPickerType,
  | "emojiLibrary"
  | "i18n"
  | "isSearching"
  | "onMouseOver"
  | "onSelectEmoji"
  | "refs"
  | "searchResult"
  | "settings"
  | "visibleCategories"
>;

export type RowOfButtonsProps = {
  row: GridRow;
} & Pick<UseEmojiPickerType, "emojiLibrary" | "onMouseOver" | "onSelectEmoji">;

const Button = memo(({ emoji, index, onMouseOver, onSelect }: EmojiButtonProps) => {
  return (
    <button
      className="group relative flex size-9 cursor-pointer items-center justify-center border-none bg-transparent text-2xl leading-none"
      onClick={() => onSelect(emoji)}
      onMouseEnter={() => onMouseOver(emoji)}
      onMouseLeave={() => onMouseOver()}
      aria-label={emoji.skins[0]?.native}
      data-index={index}
      tabIndex={-1}
      type="button"
    >
      <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100" aria-hidden="true" />
      <span
        className="relative"
        style={{
          fontFamily:
            '"Apple Color Emoji", "Segoe UI Emoji", NotoColorEmoji, "Noto Color Emoji", "Segoe UI Symbol", "Android Emoji", EmojiSymbols',
        }}
        data-emoji-set="native"
      >
        {emoji.skins[0]?.native}
      </span>
    </button>
  );
});
Button.displayName = "Button";

const RowOfButtons = memo(({ emojiLibrary, row, onMouseOver, onSelectEmoji }: RowOfButtonsProps) => (
  <div key={row.id} className="flex" data-index={row.id}>
    {row.elements.map((emojiId, index) => (
      <Button
        key={emojiId}
        onMouseOver={onMouseOver}
        onSelect={onSelectEmoji}
        emoji={emojiLibrary.getEmoji(emojiId)}
        index={index}
      />
    ))}
  </div>
));
RowOfButtons.displayName = "RowOfButtons";

export function EmojiPickerContent({
  emojiLibrary,
  i18n,
  isSearching = false,
  refs,
  searchResult,
  settings = EmojiSettings,
  visibleCategories,
  onMouseOver,
  onSelectEmoji,
}: EmojiPickerContentProps) {
  const getRowWidth = settings.perLine.value * settings.buttonSize.value;

  const isCategoryVisible = useCallback(
    (categoryId: any) => {
      return visibleCategories.has(categoryId) ? visibleCategories.get(categoryId) : false;
    },
    [visibleCategories],
  );

  const EmojiList = useCallback(() => {
    return emojiLibrary
      .getGrid()
      .sections()
      .map(({ id: categoryId }) => {
        const section = emojiLibrary.getGrid().section(categoryId);
        const { buttonSize } = settings;

        return (
          <div
            key={categoryId}
            ref={section.root as React.RefObject<HTMLDivElement>}
            style={{ width: getRowWidth }}
            data-id={categoryId}
          >
            <div className="sticky -top-px z-1 bg-popover/90 p-1 py-2 text-sm font-semibold backdrop-blur-xs">
              {i18n.categories[categoryId]}
            </div>
            <div className="relative flex flex-wrap" style={{ height: section.getRows().length * buttonSize.value }}>
              {isCategoryVisible(categoryId) &&
                section
                  .getRows()
                  .map((row: GridRow) => (
                    <RowOfButtons
                      key={row.id}
                      onMouseOver={onMouseOver}
                      onSelectEmoji={onSelectEmoji}
                      emojiLibrary={emojiLibrary}
                      row={row}
                    />
                  ))}
            </div>
          </div>
        );
      });
  }, [emojiLibrary, getRowWidth, i18n.categories, isCategoryVisible, onSelectEmoji, onMouseOver, settings]);

  const SearchList = useCallback(() => {
    return (
      <div style={{ width: getRowWidth }} data-id="search">
        <div className="sticky -top-px z-1 bg-popover/90 p-1 py-2 text-sm font-semibold text-card-foreground backdrop-blur-xs">
          {i18n.searchResult}
        </div>
        <div className="relative flex flex-wrap">
          {searchResult.map((emoji: Emoji, index: number) => (
            <Button
              key={emoji.id}
              onMouseOver={onMouseOver}
              onSelect={onSelectEmoji}
              emoji={emojiLibrary.getEmoji(emoji.id)}
              index={index}
            />
          ))}
        </div>
      </div>
    );
  }, [emojiLibrary, getRowWidth, i18n.searchResult, searchResult, onSelectEmoji, onMouseOver]);

  return (
    <div
      ref={refs.current.contentRoot as React.RefObject<HTMLDivElement>}
      className={cn(
        "h-full min-h-[50%] overflow-x-hidden overflow-y-auto px-2",
        "[&::-webkit-scrollbar]:w-4",
        "[&::-webkit-scrollbar-button]:hidden [&::-webkit-scrollbar-button]:size-0",
        ":hover:[&::-webkit-scrollbar-thumb]:bg-[#f3f4f6]",
        "[&::-webkit-scrollbar-thumb]:min-h-[65px] [&::-webkit-scrollbar-thumb]:rounded-2xl [&::-webkit-scrollbar-thumb]:border-4 [&::-webkit-scrollbar-thumb]:border-white",
        "[&::-webkit-scrollbar-track]:border-0",
      )}
      data-id="scroll"
    >
      <div ref={refs.current.content as React.RefObject<HTMLDivElement>} className="h-full">
        {isSearching ? SearchList() : EmojiList()}
      </div>
    </div>
  );
}
