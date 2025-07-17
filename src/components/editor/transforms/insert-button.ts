import type { PlateEditor } from "@udecode/plate/react";
import { InsertNodesOptions } from "@udecode/plate";
import { ButtonPlugin, TButtonElement } from "../plugins/button-plugin";

export const insertButton = (
  editor: PlateEditor,
  { url }: { url?: string },
  options: InsertNodesOptions = {},
) => {
  editor.tf.insertNodes<TButtonElement>(
    {
      type: ButtonPlugin.key,
      url,
      buttonType: "normal",
      buttonText: "Click here",
      children: [{ text: "" }],
    },
    // options
  );
};
