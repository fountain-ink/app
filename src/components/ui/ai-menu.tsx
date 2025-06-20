"use client";

import { cn } from "@udecode/cn";
import { isHotkey, type NodeEntry } from "@udecode/plate";
import { useEditorPlugin, useHotkeys, usePluginOption } from "@udecode/plate/react";
import { AIChatPlugin, useEditorChat, useLastAssistantMessage } from "@udecode/plate-ai/react";
import { BlockSelectionPlugin, useIsSelecting } from "@udecode/plate-selection/react";
import { ArrowUpIcon } from "lucide-react";
import { useEffect } from "react";
import { useChat } from "@/hooks/use-chat";
import { AIChatEditor } from "./ai-chat-editor";
import { Button } from "./button";
import {
  ComboboxContent,
  ComboboxInput,
  ComboboxList,
  Menu,
  MenuContent,
  useComboboxValueState,
  useMenuStore,
} from "./menu";
import { TextareaAutosize } from "./textarea";

export const AIMenu = () => {
  const { api, editor } = useEditorPlugin(AIChatPlugin);
  const open = usePluginOption(AIChatPlugin, "open");
  const mode = usePluginOption(AIChatPlugin, "mode");
  const isSelecting = useIsSelecting();

  const chat = useChat();
  const { input, isLoading, messages, setInput } = chat;

  const content = useLastAssistantMessage()?.content;

  const { show, store } = useMenuStore();

  useEditorChat({
    chat,
    onOpenBlockSelection: (blocks: NodeEntry[]) => {
      show(editor.api.toDOMNode(blocks.at(-1)![0])!);
    },
    onOpenChange: (open) => {
      if (!open) {
        store.hideAll();
        setInput("");
      }
    },
    onOpenCursor: () => {
      const [ancestor] = editor.api.block({ highest: true })!;

      if (!editor.api.isAt({ end: true }) && !editor.api.isEmpty(ancestor)) {
        editor.getApi(BlockSelectionPlugin).blockSelection.addSelectedRow(ancestor.id as string);
      }

      show(editor.api.toDOMNode(ancestor)!);
    },
    onOpenSelection: () => {
      show(editor.api.toDOMNode(editor.api.blocks().at(-1)![0])!);
    },
  });

  useHotkeys(
    "meta+j",
    () => {
      api.aiChat.show();
    },
    { enableOnContentEditable: true, enableOnFormTags: true },
  );

  useHotkeys("escape", () => {
    if (isLoading) {
      api.aiChat.stop();
    } else {
      api.aiChat.hide();
    }
  });

  return (
    <Menu open={open} placement="bottom-start" store={store}>
      <MenuContent
        variant="ai"
        onClickOutside={() => {
          api.aiChat.hide();
        }}
        flip={false}
        wrapperProps={{
          // FIXME: It is best to set it to 100.
          // But it will cause a horizontal scrollbar to appear.
          // A method should be found to disable translate-x.
          className: "w-[98%]!",
        }}
      >
        <ComboboxContent variant="ai">
          {mode === "chat" && isSelecting && content && <AIChatEditor content={content} />}

          <div className="flex gap-1.5 px-3 text-sm">
            {isLoading ? (
              <div className="flex grow items-center gap-2 py-2 text-muted-foreground select-none">
                {messages.length > 1 ? "Editing" : "Thinking"}

                <LoadingIcon />
              </div>
            ) : (
              <AIMenuCombobox />
            )}

            <Button
              size="iconSm"
              variant="ghost"
              className="mt-1 shrink-0 no-focus-ring"
              disabled={!isLoading && input.trim().length === 0}
              onClick={() => {
                if (isLoading) {
                  api.aiChat.stop();
                } else {
                  void api.aiChat.submit();
                }
              }}
            >
              {isLoading ? <StopIcon /> : <SubmitIcon />}
            </Button>
          </div>
        </ComboboxContent>

        {!isLoading && (
          <ComboboxList variant="ai" className={cn("[&_.menu-item-icon]:text-purple-700")}>
            {/* <AIMenuItems /> */}
          </ComboboxList>
        )}
      </MenuContent>
    </Menu>
  );
};

function AIMenuCombobox() {
  const { api } = useEditorPlugin(AIChatPlugin);
  const { input, handleInputChange } = usePluginOption(AIChatPlugin, "chat");
  const [, setValue] = useComboboxValueState();

  useEffect(() => {
    if (setValue) {
      setValue(input ?? "");
    }
  }, [input, setValue]);

  return (
    <ComboboxInput autoSelect="always" autoFocus>
      <TextareaAutosize
        variant="ai"
        className="grow"
        onChange={handleInputChange}
        onKeyDown={(e) => {
          if (isHotkey("backspace")(e) && input?.length === 0) {
            e.preventDefault();
            api.aiChat.hide();
          }
          if (isHotkey("enter")(e) && !e.shiftKey) {
            e.preventDefault();

            if (input && input.length > 0) {
              void api.aiChat.submit();
            }
          }
        }}
        placeholder="Ask AI anything..."
        data-plate-focus
      />
    </ComboboxInput>
  );
}

function StopIcon() {
  return (
    <svg height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" fill="black" r="10" />
      <rect fill="white" height="6" rx="1" width="6" x="7" y="7" />
    </svg>
  );
}

function SubmitIcon() {
  return (
    <div className={cn("flex size-5 items-center justify-center rounded-full bg-brand")}>
      <ArrowUpIcon className="size-3! stroke-[3px] text-background" />
    </div>
  );
}

function LoadingIcon() {
  return (
    <div className="flex gap-0.5">
      {["#eab308", "#ea580c", "#6EB6F2"].map((color, index) => (
        <div
          key={color}
          className="size-1 animate-ai-bounce rounded-full"
          style={{
            animationDelay: `${index * 0.1}s`,
            backgroundColor: color,
          }}
        />
      ))}
    </div>
  );
}
