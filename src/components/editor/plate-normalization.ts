import { type TElement, getNodeString, insertEmptyElement, isEditor, removeNodes } from "@udecode/plate-common";
import type { PlateEditor } from "@udecode/plate-common/react";
import { createPlatePlugin } from "@udecode/plate-common/react";
import { HEADING_KEYS } from "@udecode/plate-heading";

export interface NormalizePluginOptions {
  requireH1?: boolean;
  requireH2?: boolean;
}

const DEFAULT_OPTIONS: NormalizePluginOptions = {
  requireH1: true,
  requireH2: false,
};

export function ensureLeadingBlock(editor: PlateEditor, { event }: { event?: React.MouseEvent } = {}) {
  const { children } = editor;

  if (children.length === 0) {
    // Don't try to select an empty editor
    event?.preventDefault();
    event?.stopPropagation();

    insertEmptyElement(editor, HEADING_KEYS.h1, { select: true });
  } else if (children?.[0]?.type !== HEADING_KEYS.h1) {
    insertEmptyElement(editor, HEADING_KEYS.h1, {
      at: [0],
      select: true,
    });
  }
}

const allowDelete = (editor: PlateEditor) => {
  const path = editor.selection?.anchor.path;
  const offset = editor.selection?.anchor.offset;

  if (path !== undefined && offset !== undefined && offset === 0 && path[0] === 0 && path[1] === 0) {
    return false;
  }

  return true;
};

export const NormalizePlugin = createPlatePlugin({
  key: "normalize",
  options: DEFAULT_OPTIONS,

  extendEditor: ({ editor, useOption }) => {
    const { deleteBackward, deleteForward } = editor;

    editor.deleteForward = (...args) => {
      if (allowDelete(editor)) {
        return deleteForward(...args);
      }

      const node = editor.children[0];

      if (node && getNodeString(node).length > 0) {
        return deleteForward(...args);
      }
    };

    editor.deleteBackward = (...args) => {
      if (allowDelete(editor)) {
        return deleteBackward(...args);
      }
    };

    editor.normalizeNode = (entry) => {
      const [node, path] = entry;

      ensureLeadingBlock(editor);

      if (isEditor(node)) {
        const nodes = node.children as TElement[];

        // Remove any additional h1 or h2 nodes
        for (let i = 1; i < nodes.length; i++) {
          if (nodes[i]?.type === HEADING_KEYS.h1 || nodes[i]?.type === HEADING_KEYS.h2) {
            removeNodes(editor, { at: [i] });
            break;
          }
        }
      }
    };

    return editor;
  },
});

// Configure plugin with options if needed
export const ConfiguredNormalizePlugin = NormalizePlugin.configure({
  options: {
    requireH1: true,
    requireH2: true,
  },
});
