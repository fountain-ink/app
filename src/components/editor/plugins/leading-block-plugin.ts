import {
  type OverrideEditor,
  type PluginConfig,
  type QueryNodeOptions,
  createTSlatePlugin,
  queryNode,
} from "@udecode/plate";
import { TitlePlugin } from "./title-plugin";
import { getEditorPlugin, usePluginOption } from "@udecode/plate-core/react";
import { YjsPlugin } from "@udecode/plate-yjs/react";
import { useMounted } from "@/hooks/use-mounted";
export type LeadingBlockConfig = PluginConfig<
  "leadingBlock",
  {
    /** Level where the leading node should be, the first level being 0. */
    level?: number;
    /** Type of the leading block */
    type?: string;
  } & QueryNodeOptions
>;

/**
 * Add a leading block when the first node type is not `type`
 */
const withLeadingBlock: OverrideEditor<LeadingBlockConfig> = ({ editor, getOptions, tf: { normalizeNode } }) => ({
  transforms: {
    normalizeNode([currentNode, currentPath]) {
      const { level, type, ...query } = getOptions();
      const isSynced = editor.getOptions(YjsPlugin)?._isSynced;
      const isConnected = editor.getOptions(YjsPlugin)?._isConnected;

      if (!isSynced || !isConnected) return normalizeNode([currentNode, currentPath]);

      if (currentPath.length === 0) {
        const firstChild = editor.children[0];

        if (!firstChild || firstChild.type !== type) {
          editor.tf.insertNodes(editor.api.create.block({ type }), { at: [0] });
          return;
        }
      }

      return normalizeNode([currentNode, currentPath]);
    },
  },
});

/** @see {@link withLeadingBlock} */
export const LeadingBlockPlugin = createTSlatePlugin<LeadingBlockConfig>({
  key: "leadingBlock",
  options: {
    level: 0,
  },
})
  .overrideEditor(withLeadingBlock)
  .extend(({ editor }) => ({
    options: {
      type: editor.getType(TitlePlugin),
    },
  }));
