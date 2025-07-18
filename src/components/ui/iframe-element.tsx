"use client";

import { cn, withRef } from "@udecode/cn";
import { PlateElement, useEditorRef, useElement, useReadOnly, useSelected } from "@udecode/plate/react";
import DOMPurify from "dompurify";
import { AlertCircleIcon, CheckIcon, Link2OffIcon, LinkIcon } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { loadIframelyEmbedJs } from "@/lib/load-embed-js";
import { useIframeState } from "../../hooks/use-iframe-state";
import { TIframeElement } from "../editor/plugins/iframe-plugin";
import { LoadingSpinner } from "../misc/loading-spinner";
import { Button } from "./button";
import { ElementPopover, type ElementWidth, widthVariants } from "./element-popover";
import { Input } from "./input";

export const IframeElement = withRef<typeof PlateElement>(({ children, className, ...props }, ref) => {
  const { isLoading, error, unsafeUrl, html } = useIframeState();
  const [sanitizedHtml, setSanitizedHtml] = useState("");
  const editor = useEditorRef();
  const element = useElement<TIframeElement>();
  const [width, setWidth] = useState<ElementWidth>((element?.width as ElementWidth) || "column");
  const readOnly = useReadOnly();
  const selected = useSelected();

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
      editor.tf.setNodes<TIframeElement>(
        { url: editUrlValue, html: undefined },
        {
          at: editor.selection ?? element,
        },
      );
      console.log(editor.children);
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
        className="border px-3 h-10 rounded-md text-sm bg-background text-foreground 
        focus:ring-1 focus:ring-ring min-w-[200px] sm:min-w-[250px] md:min-w-[300px] w-full"
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
      DOMPurify.sanitize(html || "", {
        ADD_TAGS: ["iframe"],
        ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling"],
        FORBID_TAGS: ["script"],
      }),
    );
  }, [html]);

  useEffect(() => {
    loadIframelyEmbedJs();
  }, [sanitizedHtml]);

  const divWithIframe = useMemo(() => {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-sm",
          !readOnly && "pointer-events-none cursor-default",
        )}
        // biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized iframe embed HTML
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    );
  }, [sanitizedHtml, readOnly]);

  return (
    <ElementPopover
      open={selected}
      showCaption={false}
      defaultWidth={width}
      onWidthChange={handleWidth}
      content={editUrlPopoverContent}
    >
      <PlateElement ref={ref} className={cn(className, "my-9 flex flex-col items-center rounded-sm")} {...props}>
        <motion.figure
          className={cn(
            "group relative m-0 w-full h-auto rounded-sm flex-1",
            selected && !readOnly && "ring ring-2 ring-ring",
            !readOnly && "cursor-pointer",
            error && "border border-destructive ",
          )}
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
            <div className="flex relative overflow-hidden flex-col rounded-sm text-muted-foreground aspect-video gap-2 p-4 items-center justify-center rounded-sm">
              <LoadingSpinner />
              <div className="placeholder-background" />
            </div>
          )}

          {error && (
            <div className="flex relative overflow-hidden flex-col rounded-sm aspect-video bg-destructive/10 gap-2 p-4 items-center justify-center">
              <div className="flex items-center gap-2">
                <AlertCircleIcon className="w-5 h-5 text-destructive flex-shrink-0" />
                <span className="text-base line-clamp-3">{error}</span>
              </div>
              <span className="text-xs p-2 border border-dashed border-destructive bg-destructive/30 rounded-md text-muted-foreground">
                {unsafeUrl}
              </span>
              <div className="placeholder-background" />
            </div>
          )}

          {!isLoading &&
            !error &&
            (html ? (
              <div
                className={cn(
                  "w-full h-full relative not-prose not-article m-0 rounded-sm",
                  // selected && !readOnly && "ring ring-2 ring-ring",
                  !readOnly && "cursor-default",
                )}
              >
                {divWithIframe}
              </div>
            ) : !unsafeUrl ? (
              <div className="flex flex-col relative overflow-hidden rounded-sm aspect-video bg-muted/20 gap-2 p-4 items-center justify-center">
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-base select-none text-muted-foreground">Add a link to embed</span>
                </div>
                <div className="placeholder-background" />
              </div>
            ) : (
              <div className="flex flex-col rounded-sm aspect-video bg-muted/20 gap-2 p-4 items-center justify-center">
                <div className="flex items-center gap-2">
                  <Link2OffIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  <span className="text-base text-muted-foreground">No preview available for this link</span>
                </div>
                <span className="text-xs p-2 max-w-full truncate border border-dashed border-border bg-muted/30 rounded-md text-muted-foreground">
                  {unsafeUrl}
                </span>
                <div className="placeholder-background" />
              </div>
            ))}
        </motion.figure>

        {children}
      </PlateElement>
    </ElementPopover>
  );
});
