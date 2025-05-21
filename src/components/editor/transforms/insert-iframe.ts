import { InsertNodesOptions, SlateEditor } from "@udecode/plate";
import { BaseIframePlugin, TIframeElement } from "../plugins/iframe-plugin";

export const insertIframe = (
  editor: SlateEditor,
  { url = "" }: Partial<TIframeElement>,
  options: InsertNodesOptions = {},
): void => {
  if (!editor.selection) return;

  const selectionParentEntry = editor.api.parent(editor.selection);

  if (!selectionParentEntry) return;

  const [, path] = selectionParentEntry;
  editor.tf.insertNodes<TIframeElement>(
    {
      children: [{ text: "" }],
      type: editor.getType(BaseIframePlugin),
      url,
    },
    {
      at: path,
      nextBlock: true,
      select: true,
      ...(options as any),
    },
  );
};
