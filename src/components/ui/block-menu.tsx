"use client";

import React, { useState } from "react";

import { useEditorPlugin, useEditorRef, useHotkeys } from "@udecode/plate-common/react";
import { BlockMenuPlugin, BlockSelectionPlugin } from "@udecode/plate-selection/react";

import { BlockMenuItems } from "./block-menu-items";
import { Input } from "./input";
import {
  type MenuContentProps,
  type MenuProps,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxList,
  Menu,
  MenuContent,
  MenuTrigger,
  useComboboxValueState,
} from "./menu";

type BlockMenu = Pick<MenuProps, "open" | "placement" | "store"> &
  Pick<MenuContentProps, "animateZoom" | "getAnchorRect"> & {
    id?: string;
    children?: React.ReactNode;
  };

export const BlockMenu = React.forwardRef<HTMLDivElement, BlockMenu>(
  ({ id, animateZoom, children, getAnchorRect, open: openProp, placement, store }, ref) => {
    const editor = useEditorRef();
    const [open, setOpen] = useState(false);

    return (
      <Menu
        open={openProp ?? open}
        onOpenChange={(open) => {
          setOpen(open);

          if (!open) {
            editor.getApi(BlockMenuPlugin).blockMenu.hide();
          } else if (id) {
            editor.getApi(BlockMenuPlugin).blockMenu.show(id);
          }
        }}
        placement={placement}
        store={store}
        trigger={children ? <MenuTrigger>{children}</MenuTrigger> : undefined}
      >
        <MenuContent
          ref={ref}
          animateZoom={animateZoom}
          autoFocusOnHide={false}
          getAnchorRect={getAnchorRect}
          preventBodyScroll={children !== undefined}
          portal
        >
          <ComboboxContent>
            <BlockMenuInput
              onHide={() => {
                setOpen(false);
                editor.getApi(BlockMenuPlugin).blockMenu.hide();
              }}
            />
          </ComboboxContent>

          <ComboboxList>
            <ComboboxEmpty />

            <BlockMenuItems />
          </ComboboxList>
        </MenuContent>
      </Menu>
    );
  },
);

function BlockMenuInput({ onHide }: { onHide: () => void }) {
  const { editor } = useEditorPlugin(BlockMenuPlugin);
  const blockSelectionApi = editor.getApi(BlockSelectionPlugin).blockSelection;
  const blockSelectionTf = editor.getTransforms(BlockSelectionPlugin).blockSelection;
  const [value] = useComboboxValueState();

  useHotkeys(
    "backspace",
    (e) => {
      if (value.length === 0) {
        e.preventDefault();
        blockSelectionTf.removeNodes();
        onHide();
      }
    },
    { enableOnFormTags: true },
  );

  useHotkeys(
    "meta+d",
    (e) => {
      if (value.length === 0) {
        e.preventDefault();
        blockSelectionTf.duplicate(blockSelectionApi.getNodes());
        onHide();
      }
    },
    { enableOnFormTags: true },
  );

  useHotkeys(
    "meta+j",
    () => {
      onHide();
    },
    { enableOnFormTags: true },
  );

  return (
    <ComboboxInput>
      <Input placeholder="Search actions..." />
    </ComboboxInput>
  );
}
