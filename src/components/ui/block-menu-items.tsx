"use client";

import { TElement } from "@udecode/plate";
import { ParagraphPlugin, useEditorRef } from "@udecode/plate/react";
import { showCaption } from "@udecode/plate-caption/react";
import { AudioPlugin, FilePlugin, ImagePlugin, MediaEmbedPlugin, VideoPlugin } from "@udecode/plate-media/react";
import {
  BlockSelectionPlugin,
  useBlockSelectionFragmentProp,
  useBlockSelectionNodes,
} from "@udecode/plate-selection/react";
import { AlignCenter, AlignLeft, AlignRight, CaptionsIcon, RefreshCwIcon, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { getBlockType, setBlockType } from "@/lib/transforms";
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
import { turnIntoItems } from "./turn-into-dropdown-menu";

export const GROUP = {
  ALIGN: "align",
  BACKGROUND: "background",
  COLOR: "color",
  TURN_INTO: "turn_into",
} as const;

export const blockMenuItems = {
  [GROUP.ALIGN]: {
    component: AlignMenuItem,
    filterItems: true,
    icon: <AlignLeft />,
    items: [
      { icon: <AlignLeft />, label: "Left", value: "left" },
      { icon: <AlignCenter />, label: "Center", value: "center" },
      { icon: <AlignRight />, label: "Right", value: "right" },
    ],
    label: "Align",
    value: GROUP.ALIGN,
  },
  [GROUP.TURN_INTO]: {
    component: TurnIntoMenuItem,
    filterItems: true,
    icon: <RefreshCwIcon size={16} />,
    items: turnIntoItems,
    label: "Turn into",
    value: GROUP.TURN_INTO,
  },
  // askAI: {
  //   focusEditor: false,
  //   icon: <SparklesIcon size={16} />,
  //   keywords: ["generate", "help", "chat"],
  //   label: "Ask AI",
  //   shortcut: "⌘+J",
  //   value: "askAI",
  //   onSelect: ({ editor }: any) => {
  //     editor.getApi(AIChatPlugin).aiChat.show();
  //   },
  // },
  caption: {
    icon: <CaptionsIcon size={16} />,
    keywords: ["alt"],
    label: "Caption",
    value: "caption",
    onSelect: ({ editor }: any) => {
      const firstBlock = editor.getApi(BlockSelectionPlugin).blockSelection.getNodes()[0];
      showCaption(editor, firstBlock[0] as TElement);
      editor.getApi(BlockSelectionPlugin).blockSelection.resetSelectedIds();
    },
  },
  // comment: {
  //   icon: <MessageSquareText size={16} />,
  //   keywords: ["note", "feedback", "annotation"],
  //   label: "Comment",
  //   shortcut: "⌘+Shift+M",
  //   value: "comment",
  //   onSelect: ({ editor }: any) => {
  //     setTimeout(() => {
  //       editor.getTransforms(BlockSelectionPlugin).blockSelection.select();
  //       editor.getTransforms(CommentsPlugin).insert.comment();
  //     }, 0);
  //   },
  // },
  delete: {
    icon: <Trash2 size={16} />,
    keywords: ["remove"],
    label: "Delete",
    shortcut: "Del or Ctrl+D",
    value: "delete",
    onSelect: ({ editor }: any) => {
      editor.getTransforms(BlockSelectionPlugin).blockSelection.removeNodes();
    },
  },
  // duplicate: {
  //   focusEditor: false,
  //   icon: <FilesIcon size={16} />,
  //   keywords: ["copy"],
  //   label: "Duplicate",
  //   shortcut: "⌘+D",
  //   value: "duplicate",
  //   onSelect: ({ editor }: any) => {
  //     editor
  //       .getTransforms(BlockSelectionPlugin)
  //       .blockSelection.duplicate(editor.getApi(BlockSelectionPlugin).blockSelection.getNodes());

  //     editor.getApi(BlockSelectionPlugin).blockSelection.focus();
  //   },
  // },
};

const orderedMenuItems: any[] = [
  // {
  //   items: [blockMenuItems.comment],
  // },
  // {
  //   items: [blockMenuItems.askAI, blockMenuItems.delete, blockMenuItems.duplicate, blockMenuItems[GROUP.TURN_INTO]],
  // },
  {
    items: [blockMenuItems.delete, blockMenuItems, blockMenuItems[GROUP.TURN_INTO]],
  },
];

const mediaMenuItems = [
  // {
  //   items: [blockMenuItems.comment, blockMenuItems.caption],
  // },
  {
    items: [blockMenuItems.caption],
  },
  {
    items: [blockMenuItems[GROUP.ALIGN]],
  },
  {
    items: [blockMenuItems.delete],
  },
];

export function BlockMenuItems() {
  const [searchValue] = useComboboxValueState();
  const selectedBlocks = useBlockSelectionNodes();
  const editor = useEditorRef();

  const menuGroups = useMemo(() => {
    const isMedia =
      selectedBlocks.length === 1 &&
      selectedBlocks.some((item) =>
        [AudioPlugin.key, FilePlugin.key, ImagePlugin.key, MediaEmbedPlugin.key, VideoPlugin.key].includes(
          item[0].type as any,
        ),
      );

    const items = isMedia ? mediaMenuItems : orderedMenuItems;

    return filterMenuGroups(items, searchValue) || items;
  }, [selectedBlocks, searchValue]);

  return (
    <>
      {menuGroups.map((group, index) => (
        <MenuGroup key={`${index}-${group.label}`} label={group.label}>
          {group.items?.map((item: Action) => {
            if (!item.value) return null;
            const menuItem = blockMenuItems[item.value as keyof typeof blockMenuItems];

            if ("component" in menuItem && menuItem.component) {
              const ItemComponent = menuItem.component;
              return <ItemComponent key={item.value} />;
            }

            return (
              <MenuItem
                key={item.value}
                onClick={() => {
                  if ("onSelect" in menuItem) {
                    menuItem.onSelect?.({ editor });
                  }
                  if ("focusEditor" in menuItem && menuItem.focusEditor !== false) {
                    editor.tf.focus();
                  }
                }}
                label={menuItem.label}
                icon={menuItem.icon}
                shortcut={"shortcut" in menuItem ? menuItem.shortcut : undefined}
              />
            );
          })}
        </MenuGroup>
      ))}
    </>
  );
}

function AlignMenuItem() {
  const [searchValue] = useComboboxValueState();
  const editor = useEditorRef();
  const value = useBlockSelectionFragmentProp({
    key: "align",
    defaultValue: "left",
  });

  const menuItems = useMemo(() => {
    return filterMenuItems(blockMenuItems[GROUP.ALIGN], searchValue);
  }, [searchValue]);

  const content = (
    <>
      {menuItems.map((item) => (
        <MenuItem
          key={item.value}
          checked={value === item.value}
          onClick={() => {
            editor.getTransforms(BlockSelectionPlugin).blockSelection.setNodes({ align: item.value });
            editor.tf.focus();
          }}
          label={item.label}
          icon={item.icon}
        />
      ))}
    </>
  );

  if (searchValue) return <MenuGroup label={blockMenuItems[GROUP.ALIGN].label}>{content}</MenuGroup>;

  return (
    <Menu
      placement="right"
      trigger={<MenuTrigger label={blockMenuItems[GROUP.ALIGN].label} icon={blockMenuItems[GROUP.ALIGN].icon} />}
    >
      <MenuContent portal>
        <MenuGroup>{content}</MenuGroup>
      </MenuContent>
    </Menu>
  );
}

function TurnIntoMenuItem() {
  const editor = useEditorRef();
  const [searchValue] = useComboboxValueState();

  const value = useBlockSelectionFragmentProp({
    defaultValue: ParagraphPlugin.key,
    getProp: (node) => getBlockType(node as any),
  });

  const handleTurnInto = (value: string) => {
    for (const [, path] of editor.getApi(BlockSelectionPlugin).blockSelection.getNodes()) {
      setBlockType(editor, value, { at: path });
    }
    editor.getApi(BlockSelectionPlugin).blockSelection.focus();
  };

  const menuItems = useMemo(() => {
    return filterMenuItems(blockMenuItems[GROUP.TURN_INTO], searchValue);
  }, [searchValue]);

  const content = (
    <>
      {menuItems.map((item) => (
        <MenuItem
          key={item.value}
          checked={value === item.value}
          onClick={() => item.value && handleTurnInto(item.value)}
          label={item.label}
          icon={
            <div className="flex size-5 items-center justify-center rounded-sm border border-foreground/15 bg-white p-0.5 text-subtle-foreground [&_svg]:size-3">
              {item.icon}
            </div>
          }
        />
      ))}
    </>
  );

  if (searchValue) return <MenuGroup label={blockMenuItems[GROUP.TURN_INTO].label}>{content}</MenuGroup>;

  return (
    <Menu
      placement="right"
      trigger={
        <MenuTrigger label={blockMenuItems[GROUP.TURN_INTO].label} icon={blockMenuItems[GROUP.TURN_INTO].icon} />
      }
    >
      <MenuContent portal>
        <MenuGroup>{content}</MenuGroup>
      </MenuContent>
    </Menu>
  );
}
