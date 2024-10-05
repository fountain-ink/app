"use client";

import { env } from "@/env";
import { TiptapCollabProvider } from "@hocuspocus/provider";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import {
  EditorBubble,
  EditorCommand,
  EditorCommandEmpty,
  EditorCommandItem,
  EditorCommandList,
  EditorContent,
  type EditorInstance,
  EditorRoot,
  type JSONContent,
} from "novel";
import { useEffect, useMemo, useState } from "react";
import * as Y from "yjs";
import { suggestionItems } from "./extensions/slash-command";

import { useDocumentStorage } from "@/hooks/use-document-storage";
import { uploadFn } from "@/lib/upload-file";
import { proseClasses } from "@/styles/prose";
import { handleCommandNavigation } from "novel/extensions";
import { useDebouncedCallback } from "use-debounce";
import { LoadingSpinner } from "../loading-spinner";
import { defaultExtensions } from "./editor-extensions";
import { handleImageDrop, handleImagePaste } from "./plugins/image-upload";
import { ColorSelector } from "./selectors/select-color";
import { LinkSelector } from "./selectors/select-link";
import { NodeSelector } from "./selectors/select-node";
import { TextButtons } from "./selectors/select-text";

const token = env.NEXT_PUBLIC_HOCUSPOCUS_JWT_TOKEN;
const colors = ["#958DF1", "#F98181", "#FBBC88", "#FAF594"];
const names = [
  "Stani Kulechov",
  "Peter Kerr",
  "Nicole Butler",
  "Claudia Ceniceros",
  "Maria Paula",
  "Josh Stevens",
  "Ben South Lee",
  "Nader Dabit",
  "Christina B.",
];

const getRandomElement = (list: string[]) => list[Math.floor(Math.random() * list.length)];
const getRandomColor = () => getRandomElement(colors);
const getRandomName = () => getRandomElement(names);

const getInitialUser = () => {
  return {
    name: getRandomName(),
    color: getRandomColor(),
  };
};

interface EditorProps {
  documentId: string;
  initialContent?: JSONContent;
  children?: React.ReactNode;
}

export const Editor = ({ documentId, children, initialContent }: EditorProps) => {
  const [openNode, setOpenNode] = useState(false);
  const [openLink, setOpenLink] = useState(false);
  const [openColor, setOpenColor] = useState(false);
  const [openAI, _setOpenAI] = useState(false);
  const [yDoc, setYDoc] = useState<Y.Doc | null>(null);
  const [provider, setProvider] = useState<TiptapCollabProvider | null>(null);
  const [content, setContent] = useState(initialContent);
  const { getDocument } = useDocumentStorage();

  useEffect(() => {
    if (documentId.startsWith("local-")) {
      const localContent = getDocument(documentId);
      if (localContent) {
        setContent(localContent);
      }
    }
  }, [documentId, getDocument]);

  // Create a new Y.js document and provider when documentId changes
  useEffect(() => {
    const newYDoc = new Y.Doc();
    const id = documentId ?? newYDoc.clientID;
    const newProvider = new TiptapCollabProvider({
      name: `document-${id}`,
      appId: "v91rwzmo",
      token,
      document: newYDoc,
    });

    setYDoc(newYDoc);
    setProvider(newProvider);

    return () => {
      newYDoc.destroy();
      newProvider.destroy();
    };
  }, [documentId]);

  const editorExtensionsList = useMemo(() => {
    if (!yDoc || !provider) {
      return defaultExtensions;
    }
    return [
      ...defaultExtensions({
        provider: provider,
      }),

      Collaboration.configure({
        document: yDoc,
      }),
      CollaborationCursor.configure({
        provider: provider,
        user: getInitialUser(),
      }),
    ];
  }, [yDoc, provider]);

  const debouncedUpdates = useDebouncedCallback(async (editor: EditorInstance) => {
    const json = editor.getJSON();
    setContent(json);
  }, 500);

  if (!yDoc || !provider) {
    return <LoadingSpinner />;
  }

  return (
    <EditorRoot>
      <EditorContent
        immediatelyRender={false}
        onUpdate={({ editor }) => {
          debouncedUpdates(editor);
        }}
        initialContent={content}
        editorProps={{
          handlePaste: (view, event) => handleImagePaste(view, event, uploadFn),
          handleDrop: (view, event, _slice, moved) => handleImageDrop(view, event, moved, uploadFn),
          handleDOMEvents: {
            keydown: (_view, event) => handleCommandNavigation(event),
          },
          attributes: {
            class: proseClasses,
          },
        }}
        extensions={editorExtensionsList}
      >
        {children}
        <EditorCommand className="z-50 h-auto max-h-[330px]  w-72 overflow-y-auto rounded-md border border-muted bg-card px-1 py-2 shadow-md transition-all">
          <EditorCommandEmpty className="px-2 text-muted-foreground">No results</EditorCommandEmpty>
          <EditorCommandList>
            {suggestionItems.map((item) => (
              <EditorCommandItem
                value={item.title}
                onCommand={(val) => item.command?.(val) ?? null}
                className={
                  "flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-accent "
                }
                key={item.title}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md border border-muted bg-background">
                  {item.icon}
                </div>
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </EditorCommandItem>
            ))}
          </EditorCommandList>
        </EditorCommand>
        <EditorBubble
          tippyOptions={{
            placement: openAI ? "bottom-start" : "top",
          }}
          className="flex w-fit max-w-[90vw] overflow-hidden rounded border border-muted bg-card shadow-xl"
        >
          <NodeSelector open={openNode} onOpenChange={setOpenNode} />
          <LinkSelector open={openLink} onOpenChange={setOpenLink} />
          <TextButtons />
          <ColorSelector open={openColor} onOpenChange={setOpenColor} />
        </EditorBubble>
      </EditorContent>
    </EditorRoot>
  );
};
