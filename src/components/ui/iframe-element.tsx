"use client";

import React, { useEffect, useMemo, useState } from "react";

import { cn, withRef } from "@udecode/cn";
import { PlateElement, useReadOnly, useFocused, useSelected, useEditorRef, useElement } from "@udecode/plate/react";

import { TIframeElement } from "../editor/plugins/iframe-plugin";
import { useIframeState } from "../hooks/use-iframe-state";
import { ElementPopover, type ElementWidth, widthVariants } from "./element-popover";
import { motion } from "motion/react";
import { Button } from "./button";
import { AlertCircleIcon } from "lucide-react";
import { CheckIcon } from "lucide-react";
import { Link2OffIcon } from "lucide-react";
import { LinkIcon } from "lucide-react";
import { LoadingSpinner } from "../misc/loading-spinner";
import DOMPurify from "dompurify";
import { loadIframelyEmbedJs } from "@/lib/load-embed-js";
import { Input } from "./input";

export const IframeElement = withRef<typeof PlateElement>(({ children, className, ...props }, ref) => {
  const { embed, isLoading, error, unsafeUrl } = useIframeState();
  const [sanitizedHtml, setSanitizedHtml] = useState("");
  const editor = useEditorRef();
  const element = useElement<TIframeElement>();
  const [width, setWidth] = useState<ElementWidth>((element?.width as ElementWidth) || "column");
  const readOnly = useReadOnly();
  const selected = useSelected();
  const focused = useFocused();

  const [editUrlValue, setEditUrlValue] = useState(element.url ?? "");

  useEffect(() => {
    setEditUrlValue(element.url ?? "");
  }, [element.url]);

  useEffect(() => {
    if (element?.width) {
      setWidth(element.width as ElementWidth);
    }
  }, [element?.width]);

  const handleUrlSubmit = () => {
    if (editUrlValue !== element.url) {
      editor.tf.setNodes<TIframeElement>({ url: editUrlValue }, { at: editor.selection ?? element });
    }
  };

  const handleWidth = (newWidth: ElementWidth) => {
    setWidth(newWidth);
    editor.tf.setNodes({ width: newWidth }, { at: element });
  };

  const editUrlPopoverContent = (
    <div className="flex items-center gap-1">
      <Input
        type="text"
        value={editUrlValue}
        onChange={(e) => setEditUrlValue(e.target.value)}
        onBlur={handleUrlSubmit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleUrlSubmit();
            (e.target as HTMLElement).blur();
          }
          e.stopPropagation();
        }}
        placeholder="Enter URL and press Enter"
        className="border px-3 h-10 rounded-md text-sm bg-background text-foreground focus:ring-1 focus:ring-ring min-w-[250px] sm:min-w-[300px] md:min-w-[350px] w-full"
        onClick={(e) => e.stopPropagation()}
      />
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 flex-shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          handleUrlSubmit();
        }}
      >
        <CheckIcon className="h-4 w-4" />
      </Button>
    </div>
  );

  useEffect(() => {
    setSanitizedHtml(
      DOMPurify.sanitize(embed?.html || "", {
        ADD_TAGS: ["iframe"],
        ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling"],
        FORBID_TAGS: ["script"],
      }),
    );
  }, [embed?.html]);

  useEffect(() => {
    loadIframelyEmbedJs();
  }, [sanitizedHtml]);

  const divWithIframe = useMemo(() => {
    // biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized iframe embed HTML
    return <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
  }, [sanitizedHtml]);

  return (
    <ElementPopover
      open={selected}
      showCaption={false}
      defaultWidth={width}
      onWidthChange={handleWidth}
      content={editUrlPopoverContent}
    >
      <PlateElement
        ref={ref}
        className={cn(
          className,
          "my-9 rounded-md overflow-hidden",
          error && "border-2 border-destructive ",
          selected && !readOnly && "ring ring-2 ring-ring",
        )}
        {...props}
      >
        <motion.figure
          className="group relative m-0 w-full h-auto flex-1"
          contentEditable={false}
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
          {isLoading && (
            <div className="flex flex-col text-muted-foreground aspect-video gap-2 p-4 items-center justify-center">
              <LoadingSpinner />
              <div className="placeholder-background" />
            </div>
          )}

          {error && (
            <div className="flex flex-col aspect-video bg-destructive/10 gap-2 p-4 items-center justify-center">
              <AlertCircleIcon className="w-8 h-8 text-destructive" />
              <span className="text-sm p-4 line-clamp-3 inline-block text-center rounded-md">{error}</span>
              <span className="text-xs p-2 border border-dashed border-destructive bg-destructive/30 rounded-md text-muted-foreground">
                {unsafeUrl}
              </span>
              <div className="placeholder-background" />
            </div>
          )}

          {!isLoading &&
            !error &&
            (embed?.html ? (
              <div
                className={cn(
                  "w-full h-full relative not-prose not-article m-0",
                  selected && !readOnly && "ring ring-2 ring-ring",
                )}
              >
                {divWithIframe}
              </div>
            ) : (
              <>
                {!unsafeUrl ? (
                  <div className="flex flex-col aspect-video bg-muted/20 gap-2 p-4 items-center justify-center">
                    <LinkIcon className="w-10 h-10 text-muted-foreground" />
                    <span className="text-sm p-2 text-center text-muted-foreground">Add a link to embed content.</span>
                    <div className="placeholder-background" />
                  </div>
                ) : (
                  <div className="flex flex-col aspect-video bg-muted/20 gap-2 p-4 items-center justify-center">
                    <Link2OffIcon className="w-10 h-10 text-muted-foreground" />
                    <span className="text-sm p-2 text-center text-muted-foreground">
                      No preview available for this link.
                    </span>
                    <span className="text-xs p-2 max-w-full truncate border border-dashed border-border bg-muted/30 rounded-md text-muted-foreground">
                      {unsafeUrl}
                    </span>
                    <div className="placeholder-background" />
                  </div>
                )}
              </>
            ))}
        </motion.figure>

        {children}
      </PlateElement>
    </ElementPopover>
  );
});
