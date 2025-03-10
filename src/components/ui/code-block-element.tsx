'use client';

import { cn, withRef } from '@udecode/cn';
import { NodeApi } from '@udecode/plate';
import { formatCodeBlock, isLangSupported, TCodeBlockElement } from '@udecode/plate-code-block';
import { PlateElement, useSelected, useReadOnly, useEditorRef } from '@udecode/plate/react';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

import { Button } from './button';
import { CodeBlockCombobox } from './code-block-combobox';
import { ElementPopover, widthVariants, type ElementWidth } from './element-popover';
import { CaptionTextarea } from './caption';
import { Caption } from './caption';
import { ScrollArea } from './scroll-area';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';

export const CodeBlockElement = withRef<typeof PlateElement>(
  ({ children, className, ...props }, ref) => {
    const { element, editor } = props;
    const isSelected = useSelected();
    const [width, setWidth] = useState<ElementWidth>((element?.width as ElementWidth) || "column");
    const readOnly = useReadOnly();
    const { copyToClipboard } = useCopyToClipboard();
    const figureRef = useRef<HTMLElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    const handleWidth = (newWidth: ElementWidth) => {
      setWidth(newWidth);
      console.log(element)
      editor.tf.setNodes({ width: newWidth }, { at: element },);
    };

    useEffect(() => {
      if (!readOnly) {
        editor.tf.replaceNodes([...element.children], { at: element, children: true });
      }
    }, [])

    const popoverContent = (
      <>
        <CodeBlockCombobox />

        <Button
          size="default"
          variant={"ghost"}
          onClick={() => {
            const lines = element.children.map((child) => NodeApi.string(child));
            copyToClipboard(lines.join("\n\n"), {
              tooltip: "Copied code to clipboard",
            });
          }}
        >
          Copy
        </Button>
      </>
    );

    return (
      <ElementPopover
        ref={popoverRef}
        open={isSelected}
        sideOffset={5}
        showCaption={false}
        onWidthChange={handleWidth}
        defaultWidth={width}
        content={popoverContent}
      >
        <PlateElement
          ref={ref}
          className={cn("relative my-8 rounded-sm flex flex-col items-center", className,
            'py-1',
            '[&_.hljs-comment]:text-[#6a737d] [&_.hljs-code]:text-[#6a737d] [&_.hljs-formula]:text-[#6a737d]',
            '[&_.hljs-keyword]:text-[#d73a49] [&_.hljs-doctag]:text-[#d73a49] [&_.hljs-template-tag]:text-[#d73a49] [&_.hljs-template-variable]:text-[#d73a49] [&_.hljs-type]:text-[#d73a49] [&_.hljs-variable.language_]:text-[#d73a49]',
            '[&_.hljs-title]:text-[#6f42c1] [&_.hljs-title.class_]:text-[#6f42c1] [&_.hljs-title.class_.inherited__]:text-[#6f42c1] [&_.hljs-title.function_]:text-[#6f42c1]',
            '[&_.hljs-attr]:text-[#005cc5] [&_.hljs-attribute]:text-[#005cc5] [&_.hljs-literal]:text-[#005cc5] [&_.hljs-meta]:text-[#005cc5] [&_.hljs-number]:text-[#005cc5] [&_.hljs-operator]:text-[#005cc5] [&_.hljs-selector-attr]:text-[#005cc5] [&_.hljs-selector-class]:text-[#005cc5] [&_.hljs-selector-id]:text-[#005cc5] [&_.hljs-variable]:text-[#005cc5]',
            '[&_.hljs-regexp]:text-[#032f62] [&_.hljs-string]:text-[#032f62] [&_.hljs-meta_.hljs-string]:text-[#032f62]',
            '[&_.hljs-built_in]:text-[#e36209] [&_.hljs-symbol]:text-[#e36209]',
            '[&_.hljs-name]:text-[#22863a] [&_.hljs-quote]:text-[#22863a] [&_.hljs-selector-tag]:text-[#22863a] [&_.hljs-selector-pseudo]:text-[#22863a]',
            '[&_.hljs-emphasis]:italic',
            '[&_.hljs-strong]:font-bold',
            '[&_.hljs-section]:font-bold [&_.hljs-section]:text-[#005cc5]',
            '[&_.hljs-bullet]:text-[#735c0f]',
            '[&_.hljs-addition]:bg-[#f0fff4] [&_.hljs-addition]:text-[#22863a]',
            '[&_.hljs-deletion]:bg-[#ffeef0] [&_.hljs-deletion]:text-[#b31d28]',

            'dark:[&_.hljs-comment]:text-[#8b949e] dark:[&_.hljs-code]:text-[#8b949e] dark:[&_.hljs-formula]:text-[#8b949e]',
            'dark:[&_.hljs-keyword]:text-[#ff7b72] dark:[&_.hljs-doctag]:text-[#ff7b72] dark:[&_.hljs-template-tag]:text-[#ff7b72] dark:[&_.hljs-template-variable]:text-[#ff7b72] dark:[&_.hljs-type]:text-[#ff7b72] dark:[&_.hljs-variable.language_]:text-[#ff7b72]',
            'dark:[&_.hljs-title]:text-[#d2a8ff] dark:[&_.hljs-title.class_]:text-[#d2a8ff] dark:[&_.hljs-title.class_.inherited__]:text-[#d2a8ff] dark:[&_.hljs-title.function_]:text-[#d2a8ff]',
            'dark:[&_.hljs-attr]:text-[#79c0ff] dark:[&_.hljs-attribute]:text-[#79c0ff] dark:[&_.hljs-literal]:text-[#79c0ff] dark:[&_.hljs-meta]:text-[#79c0ff] dark:[&_.hljs-number]:text-[#79c0ff] dark:[&_.hljs-operator]:text-[#79c0ff] dark:[&_.hljs-selector-attr]:text-[#79c0ff] dark:[&_.hljs-selector-class]:text-[#79c0ff] dark:[&_.hljs-selector-id]:text-[#79c0ff] dark:[&_.hljs-variable]:text-[#79c0ff]',
            'dark:[&_.hljs-regexp]:text-[#a5d6ff] dark:[&_.hljs-string]:text-[#a5d6ff] dark:[&_.hljs-meta_.hljs-string]:text-[#a5d6ff]',
            'dark:[&_.hljs-built_in]:text-[#ffa657] dark:[&_.hljs-symbol]:text-[#ffa657]',
            'dark:[&_.hljs-name]:text-[#7ee787] dark:[&_.hljs-quote]:text-[#7ee787] dark:[&_.hljs-selector-tag]:text-[#7ee787] dark:[&_.hljs-selector-pseudo]:text-[#7ee787]',
            'dark:[&_.hljs-emphasis]:italic',
            'dark:[&_.hljs-strong]:font-bold',
            'dark:[&_.hljs-section]:font-bold dark:[&_.hljs-section]:text-[#79c0ff]',
            'dark:[&_.hljs-bullet]:text-[#eac55f]',
            'dark:[&_.hljs-addition]:bg-[#033a16] dark:[&_.hljs-addition]:text-[#7ee787]',
            'dark:[&_.hljs-deletion]:bg-[#67060c] dark:[&_.hljs-deletion]:text-[#ff7b72]'
          )}
          {...props}
        >
          <motion.figure
            ref={figureRef}
            className="group w-full flex flex-col items-center"
            layout="size"
            layoutDependency={width}
            initial={width}
            animate={width}
            variants={widthVariants}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 30,
            }}
          >
            <ScrollArea
              orientation="horizontal"
              className={cn(
                "rounded-sm bg-muted text-foreground overflow-hidden w-full",
                isSelected && "ring-2 ring-ring",
              )}
            >
              <pre className="bg-muted px-6 py-4 text-foreground/80 font-mono text-sm not-prose leading-[normal] [tab-size:2] min-w-full" spellCheck="false">
                <code spellCheck="false">{children}</code>
              </pre>
            </ScrollArea>

            {/* {isLangSupported(element.lang as string) && (
              <div className="absolute top-1 right-1 z-10 flex gap-0.5 select-none">
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-6 text-xs"
                  onClick={() => formatCodeBlock(editor, { element })}
                  title="Format code"
                >
                  Format
                  <BracesIcon className="!size-3.5 text-muted-foreground" />
                </Button>
              </div>
            )} */}
          </motion.figure>

          <AnimatePresence mode="wait">
            <div className="w-full flex justify-center">
              <Caption align="center">
                <CaptionTextarea
                  readOnly={readOnly}
                  onFocus={(e) => {
                    e.preventDefault();
                  }}
                  placeholder="Write a caption..."
                />
              </Caption>
            </div>
          </AnimatePresence>
        </PlateElement>
      </ElementPopover>
    );
  }
);