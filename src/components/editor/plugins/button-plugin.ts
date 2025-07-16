import { createTSlatePlugin, type PluginConfig, type TElement } from "@udecode/plate";
import { toPlatePlugin } from "@udecode/plate-core/react";
import { ButtonElement } from "@/components/ui/button-element";

export type ButtonConfig = PluginConfig<"button">;

export type ButtonType = "normal" | "newsletter" | "follow";

export interface TButtonElement extends TElement {
  type: "button";
  buttonType?: ButtonType;
  url?: string;
  text?: string;
}

export const BaseButtonPlugin = createTSlatePlugin<ButtonConfig>({
  key: "button",
  node: {
    component: ButtonElement,
    isElement: true,
    isVoid: false,
  },
  parsers: {
    html: {
      deserializer: {
        rules: [
          {
            validNodeName: "A",
            validClassName: "editor-button",
          },
        ],
        parse: ({ element, type }) => {
          const url = element.getAttribute("href");
          const buttonType = element.getAttribute("data-button-type") as ButtonType;
          const text = element.textContent || undefined;

          return {
            type,
            buttonType: buttonType || "normal",
            url: url || undefined,
            text,
          };
        },
      },
      serializer: {
        transformNode: ({ node }: { node: TElement }) => {
          const buttonNode = node as TButtonElement;
          const a = document.createElement("a");
          a.className = "editor-button";
          if (buttonNode.url) {
            a.href = buttonNode.url;
          }
          if (buttonNode.buttonType) {
            a.setAttribute("data-button-type", buttonNode.buttonType);
          }
          a.textContent = buttonNode.text || "Click here";
          return a;
        },
      },
    },
  },
});

export const ButtonPlugin = toPlatePlugin(BaseButtonPlugin);
