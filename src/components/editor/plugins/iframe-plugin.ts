import { IframeElement } from '@/components/ui/iframe-element';
import { type PluginConfig, createTSlatePlugin } from '@udecode/plate';
import { toPlatePlugin } from '@udecode/plate-core/react';
import { MediaPluginOptions, parseIframeUrl, TMediaElement } from '@udecode/plate-media';

export type IframeConfig = PluginConfig<'iframe', MediaPluginOptions>;

export interface TIframeElement extends TMediaElement { }

export const BaseIframePlugin = createTSlatePlugin<IframeConfig>({
  key: 'iframe',
  node: {
    component: IframeElement,
    isElement: true,
    isVoid: true,
  },
  options: {
    transformUrl: parseIframeUrl,
  },
  parsers: {
    html: {
      deserializer: {
        rules: [
          {
            validNodeName: 'IFRAME',
          },
        ],
        parse: ({ element, type }) => {
          const url = element.getAttribute('src');

          if (url) {
            return {
              type,
              url,
            };
          }
        },
      },
    },
  },
});

export const IframePlugin = toPlatePlugin(BaseIframePlugin);