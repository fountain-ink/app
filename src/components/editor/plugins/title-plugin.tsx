import { createPlatePlugin } from "@udecode/plate/react";

export const TITLE_KEYS = {
  title: 'title',
  subtitle: 'subtitle',
} as const;

const createTitlePlugin = () => createPlatePlugin({
  key: TITLE_KEYS.title,
  node: { isElement: true,  type: TITLE_KEYS.title },
  parsers: {
    html: {
      deserializer: {
        rules: [
          {
            validNodeName: 'header',
            validClassName: 'title',
          },
        ],
      },
    },
  },
});

const createSubtitlePlugin = () => createPlatePlugin({
  key: TITLE_KEYS.subtitle,
  node: { isElement: true, type: TITLE_KEYS.subtitle },
  parsers: {
    html: {
      deserializer: {
        rules: [
          {
            validNodeName: 'header',
            validClassName: 'subtitle',
          },
        ],
      },
    },
  },
});

export const TitlePlugin = createTitlePlugin();
export const SubtitlePlugin = createSubtitlePlugin(); 