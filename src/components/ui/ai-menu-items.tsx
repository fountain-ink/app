"use client";

import React, { useMemo } from "react";

import { NodeApi } from "@udecode/plate";
import { AIChatPlugin, AIPlugin } from "@udecode/plate-ai/react";
import { useIsSelecting } from "@udecode/plate-selection/react";
import { type PlateEditor, useEditorRef, usePluginOption } from "@udecode/plate/react";
import {
  AlbumIcon,
  BadgeHelpIcon,
  CheckIcon,
  CornerUpLeftIcon,
  FeatherIcon,
  LanguagesIcon,
  ListEnd,
  ListMinusIcon,
  ListPlusIcon,
  PenLineIcon,
  Wand,
  X,
} from "lucide-react";

import {
  type Action,
  filterMenuGroups,
  filterMenuItems,
  Menu,
  MenuContent,
  MenuGroup,
  MenuItem,
  MenuTrigger,
  useComboboxValueState,
} from "./menu";

export type EditorChatState = "cursorCommand" | "cursorSuggestion" | "selectionCommand" | "selectionSuggestion";

export const GROUP = {
  LANGUAGES: "group_languages",
  SELECTION_LANGUAGES: "group_selection_languages",
} as const;

export const aiChatItems = {
  accept: {
    icon: <CheckIcon />,
    label: "Accept",
    value: "accept",
    onSelect: ({ editor }) => {
      editor.getTransforms(AIChatPlugin).aiChat.accept();
      editor.tf.focus({ at: editor.api.end(editor.selection!) });
    },
  },
  continueWrite: {
    icon: <PenLineIcon />,
    label: "Continue writing",
    value: "continueWrite",
    onSelect: ({ editor }) => {
      const ancestorNode = editor.api.block({ highest: true });

      if (!ancestorNode) return;

      const isEmpty = NodeApi.string(ancestorNode[0]).trim().length === 0;

      void editor.getApi(AIChatPlugin).aiChat.submit({
        mode: "insert",
        prompt: isEmpty
          ? `<Document>
{editor}
</Document>
Start writing a new paragraph AFTER <Document> ONLY ONE SENTENCE`
          : "Continue writing AFTER <Block> ONLY ONE SENTENCE. DONT REPEAT THE TEXT.",
      });
    },
  },
  discard: {
    icon: <X />,
    label: "Discard",
    shortcut: "Escape",
    value: "discard",
    onSelect: ({ editor }) => {
      editor.getTransforms(AIPlugin).ai?.undo();
      editor.getApi(AIChatPlugin).aiChat.hide();
    },
  },

  explain: {
    icon: <BadgeHelpIcon />,
    label: "Explain",
    value: "explain",
    onSelect: ({ editor }) => {
      void editor.getApi(AIChatPlugin).aiChat.submit({
        prompt: {
          default: "Explain {editor}",
          selecting: "Explain",
        },
      });
    },
  },
  fixSpelling: {
    icon: <CheckIcon />,
    label: "Fix spelling & grammar",
    value: "fixSpelling",
    onSelect: ({ editor }) => {
      void editor.getApi(AIChatPlugin).aiChat.submit({
        prompt: "Fix spelling and grammar",
      });
    },
  },
  [GROUP.LANGUAGES]: {
    component: TranslateMenuItems,
    filterItems: true,
    icon: <LanguagesIcon className="text-green-800" />,
    items: [
      { label: "English", value: "translate_english" },
      { label: "Korean", value: "translate_korean" },
      {
        label: "Chinese, Simplified",
        value: "translate_chinese_simplified",
      },
      {
        label: "Chinese, Traditional",
        value: "translate_chinese_traditional",
      },
      { label: "Japanese", value: "translate_japanese" },
      { label: "Spanish", value: "translate_spanish" },
      { label: "Russian", value: "translate_russian" },
      { label: "French", value: "translate_french" },
      { label: "Portuguese", value: "translate_portuguese" },
      { label: "German", value: "translate_german" },
      { label: "Italian", value: "translate_italian" },
      { label: "Dutch", value: "translate_dutch" },
      { label: "Indonesian", value: "translate_indonesian" },
      { label: "Filipino", value: "translate_filipino" },
      { label: "Vietnamese", value: "translate_vietnamese" },
      { label: "Turkish", value: "translate_turkish" },
      { label: "Arabic", value: "translate_arabic" },
    ],
    label: "Languages",
    value: GROUP.LANGUAGES,
  },
  [GROUP.SELECTION_LANGUAGES]: {
    component: TranslateMenuItems,
    filterItems: true,
    icon: <LanguagesIcon className="text-green-800" />,
    items: [
      { label: "English", value: "translate_english" },
      { label: "Korean", value: "translate_korean" },
      {
        label: "Chinese, Simplified",
        value: "translate_chinese_simplified",
      },
      {
        label: "Chinese, Traditional",
        value: "translate_chinese_traditional",
      },
      { label: "Japanese", value: "translate_japanese" },
      { label: "Spanish", value: "translate_spanish" },
      { label: "Russian", value: "translate_russian" },
      { label: "French", value: "translate_french" },
      { label: "Portuguese", value: "translate_portuguese" },
      { label: "German", value: "translate_german" },
      { label: "Italian", value: "translate_italian" },
      { label: "Dutch", value: "translate_dutch" },
      { label: "Indonesian", value: "translate_indonesian" },
      { label: "Filipino", value: "translate_filipino" },
      { label: "Vietnamese", value: "translate_vietnamese" },
      { label: "Turkish", value: "translate_turkish" },
      { label: "Arabic", value: "translate_arabic" },
    ],
    label: "Languages",
    value: GROUP.LANGUAGES,
  },
  improveWriting: {
    icon: <Wand />,
    label: "Improve writing",
    value: "improveWriting",
    onSelect: ({ editor }) => {
      void editor.getApi(AIChatPlugin).aiChat.submit({
        prompt: "Improve the writing",
      });
    },
  },
  insertBelow: {
    icon: <ListEnd />,
    label: "Insert below",
    value: "insertBelow",
    onSelect: ({ aiEditor, editor }) => {
      void editor.getTransforms(AIChatPlugin).aiChat.insertBelow(aiEditor);
    },
  },
  makeLonger: {
    icon: <ListPlusIcon />,
    label: "Make longer",
    value: "makeLonger",
    onSelect: ({ editor }) => {
      void editor.getApi(AIChatPlugin).aiChat.submit({
        prompt: "Make longer",
      });
    },
  },
  makeShorter: {
    icon: <ListMinusIcon />,
    label: "Make shorter",
    value: "makeShorter",
    onSelect: ({ editor }) => {
      void editor.getApi(AIChatPlugin).aiChat.submit({
        prompt: "Make shorter",
      });
    },
  },
  replace: {
    icon: <CheckIcon />,
    label: "Replace selection",
    value: "replace",
    onSelect: ({ aiEditor, editor }) => {
      void editor.getTransforms(AIChatPlugin).aiChat.replaceSelection(aiEditor);
    },
  },
  simplifyLanguage: {
    icon: <FeatherIcon />,
    label: "Simplify language",
    value: "simplifyLanguage",
    onSelect: ({ editor }) => {
      void editor.getApi(AIChatPlugin).aiChat.submit({
        prompt: "Simplify the language",
      });
    },
  },
  summarize: {
    icon: <AlbumIcon />,
    label: "Add a summary",
    value: "summarize",
    onSelect: ({ editor }) => {
      void editor.getApi(AIChatPlugin).aiChat.submit({
        mode: "insert",
        prompt: {
          default: "Summarize {editor}",
          selecting: "Summarize",
        },
      });
    },
  },
  tryAgain: {
    icon: <CornerUpLeftIcon />,
    label: "Try again",
    value: "tryAgain",
    onSelect: ({ editor }) => {
      void editor.getApi(AIChatPlugin).aiChat.reload();
    },
  },
} satisfies Record<
  string,
  {
    icon: React.ReactNode;
    label: string;
    value: string;
    component?: React.ComponentType<{ menuState: EditorChatState }>;
    filterItems?: boolean;
    items?: { label: string; value: string }[];
    shortcut?: string;
    onSelect?: ({
      aiEditor,
      editor,
    }: {
      aiEditor: PlateEditor;
      editor: PlateEditor;
    }) => void;
  }
>;

const menuStateItems = {
  cursorCommand: [
    {
      items: [aiChatItems.continueWrite, aiChatItems.summarize, aiChatItems.explain],
    },
  ],
  cursorSuggestion: [
    {
      items: [aiChatItems.accept, aiChatItems.discard, aiChatItems.tryAgain],
    },
  ],
  selectionCommand: [
    {
      items: [
        aiChatItems.improveWriting,
        aiChatItems.makeLonger,
        aiChatItems.makeShorter,
        aiChatItems.fixSpelling,
        aiChatItems.simplifyLanguage,
      ],
    },
    {
      items: [aiChatItems[GROUP.SELECTION_LANGUAGES]],
    },
  ],
  selectionSuggestion: [
    {
      items: [aiChatItems.replace, aiChatItems.insertBelow, aiChatItems.discard, aiChatItems.tryAgain],
    },
  ],
};

export function AIMenuItems() {
  const editor = useEditorRef();
  const [searchValue] = useComboboxValueState();
  const { messages } = usePluginOption(AIChatPlugin, "chat");
  const aiEditor = usePluginOption(AIChatPlugin, "aiEditor")!;
  const isSelecting = useIsSelecting();

  const menuState = useMemo(() => {
    if (messages && messages.length > 0) {
      return isSelecting ? "selectionSuggestion" : "cursorSuggestion";
    }

    return isSelecting ? "selectionCommand" : "cursorCommand";
  }, [isSelecting, messages]);

  const menuGroups = useMemo(() => {
    const items = menuStateItems[menuState] || [];

    return filterMenuGroups(items, searchValue) || items;
  }, [menuState, searchValue]);

  return (
    <>
      {menuGroups.map((group, index) => (
        <MenuGroup key={`${index}-${group.label}`} label={group.label}>
          {group.items?.map((item: Action) => {
            const menuItem: any = aiChatItems[item.value as keyof typeof aiChatItems];

            if (menuItem.component) {
              const ItemComponent = menuItem.component;

              return <ItemComponent key={item.value} menuState={menuState} />;
            }

            return (
              <MenuItem
                key={item.value}
                onClick={() => menuItem.onSelect?.({ aiEditor, editor })}
                label={menuItem.label}
                icon={menuItem.icon}
                shortcutEnter
              />
            );
          })}
        </MenuGroup>
      ))}
    </>
  );
}

function TranslateMenuItems({ menuState }: { menuState: EditorChatState }) {
  const editor = useEditorRef();
  const [searchValue] = useComboboxValueState();

  const menuItems = useMemo(() => {
    return filterMenuItems(aiChatItems[GROUP.LANGUAGES], searchValue);
  }, [searchValue]);

  const handleTranslate = (value: string) => {
    if (menuState === "cursorCommand") {
      void editor.getApi(AIChatPlugin).aiChat.submit({
        mode: "insert",
        prompt: `Translate to ${value} the "Block" content`,
      });

      return;
    }
    if (menuState === "selectionCommand") {
      void editor.getApi(AIChatPlugin).aiChat.submit({
        prompt: `Translate to ${value}`,
      });

      return;
    }
  };

  const content = (
    <>
      {menuItems.map((item) => (
        <MenuItem
          key={item.value}
          onClick={() => handleTranslate(item.label!)}
          label={item.label}
          icon={item.icon}
          shortcutEnter
        />
      ))}
    </>
  );

  if (searchValue) return <MenuGroup label={aiChatItems[GROUP.LANGUAGES].label}>{content}</MenuGroup>;

  return (
    <Menu trigger={<MenuTrigger label={aiChatItems[GROUP.LANGUAGES].label} icon={aiChatItems[GROUP.LANGUAGES].icon} />}>
      <MenuContent variant="aiSub">
        <MenuGroup>{content}</MenuGroup>
      </MenuContent>
    </Menu>
  );
}
