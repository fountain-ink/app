import type { DropdownMenuProps } from "@radix-ui/react-dropdown-menu";

import { HighlightPlugin } from "@udecode/plate-highlight/react";
import { KbdPlugin } from "@udecode/plate-kbd/react";
import { insertInlineEquation } from "@udecode/plate-math";
import { HighlighterIcon, KeyboardIcon, MoreHorizontalIcon, RadicalIcon } from "lucide-react";
import { useEditorRef } from "@udecode/plate/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  useOpenState,
} from "./dropdown-menu";
import { ToolbarButton } from "./toolbar";

export function MoreDropdownMenu(props: DropdownMenuProps) {
  const editor = useEditorRef();
  const openState = useOpenState();

  return (
    <DropdownMenu modal={false} {...openState} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton pressed={openState.open} tooltip="Insert">
          <MoreHorizontalIcon />
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="ignore-click-outside/toolbar flex max-h-[500px] min-w-[180px] flex-col overflow-y-auto"
        align="start"
      >
        <DropdownMenuGroup>
          <DropdownMenuItem
            onSelect={() => {
              editor.tf.toggleMark(HighlightPlugin.key);
              editor.tf.collapse({ edge: "end" });
              editor.tf.focus();
            }}
            className="flex items-center gap-2"
          >
            <HighlighterIcon />
            Highlight
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={() => {
              editor.tf.toggleMark(KbdPlugin.key);
              editor.tf.collapse({ edge: "end" });
              editor.tf.focus();
            }}
            className="flex items-center gap-2"
          >
            <KeyboardIcon />
            Keyboard input
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={() => {
              insertInlineEquation(editor);
            }}
            className="flex items-center gap-2"
          >
            <RadicalIcon />
            Equation
          </DropdownMenuItem>

          {/* <DropdownMenuItem
            onSelect={() => {
              editor.tf.toggle.mark({
                key: SuperscriptPlugin.key,
                clear: [SubscriptPlugin.key, SuperscriptPlugin.key],
              });
              focusEditor(editor);
            }}
          >
            <SuperscriptIcon />
            Superscript
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => {
              editor.tf.toggle.mark({
                key: SubscriptPlugin.key,
                clear: [SuperscriptPlugin.key, SubscriptPlugin.key],
              });
              focusEditor(editor);
            }}
          >
            <SubscriptIcon />
            Subscript
          </DropdownMenuItem> */}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
