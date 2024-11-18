"use client";

import { useEffect } from "react";

import type { TEquationElement } from "@udecode/plate-math";

import { cn } from "@udecode/cn";
import {
    createPrimitiveComponent,
    selectSiblingNodePoint,
    useEditorRef,
    useElement,
} from "@udecode/plate-common/react";
import { useEquationInput } from "@udecode/plate-math/react";
import { BlockSelectionPlugin } from "@udecode/plate-selection/react";
import { CornerDownLeftIcon } from "lucide-react";
import { useReadOnly, useSelected } from "slate-react";

import { Button } from "./button";
import { PopoverContent } from "./popover";

import { type TextareaAutosizeProps, TextareaAutosize } from "./textarea";

// TODO: syntax highlight
const EquationInput = createPrimitiveComponent(TextareaAutosize)({
  propsHook: useEquationInput,
});

const EquationPopoverContent = ({
  className,
  setOpen,
  ...props
}: {
  setOpen: (open: boolean) => void;
} & TextareaAutosizeProps) => {
  const editor = useEditorRef();
  const readOnly = useReadOnly();
  const element = useElement<TEquationElement>();
  const selected = useSelected();

  useEffect(() => {
    setOpen(selected);
  }, [selected, setOpen]);

  if (readOnly) return null;

  const isInline = props.variant === "equationInline";

  const onClose = () => {
    setOpen(false);

    if (isInline) {
      selectSiblingNodePoint(editor, { node: element });
    } else {
      editor.getApi(BlockSelectionPlugin).blockSelection.addSelectedRow(element.id as string);
    }
  };

  return (
    <PopoverContent
      variant="equation"
      className="flex gap-2"
      onEscapeKeyDown={(e) => {
        e.preventDefault();
      }}
      contentEditable={false}
    >
      <EquationInput className={cn("grow", className)} state={{ isInline, open: true, onClose }} autoFocus {...props} />

      <Button variant="brand" className="px-3" onClick={onClose}>
        Done <CornerDownLeftIcon className="size-3.5" />
      </Button>
    </PopoverContent>
  );
};

export { EquationPopoverContent };
