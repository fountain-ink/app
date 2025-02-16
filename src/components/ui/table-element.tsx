"use client";

import type * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import type { TTableElement } from "@udecode/plate-table";

import { cn, withRef } from "@udecode/cn";
import { BlockSelectionPlugin } from "@udecode/plate-selection/react";
import {
  TablePlugin,
  TableProvider,
  useTableBordersDropdownMenuContentState,
  useTableElement,
  useTableMergeState,
} from "@udecode/plate-table/react";
import {
  useEditorPlugin,
  useEditorRef,
  useEditorSelector,
  useElement,
  usePluginOption,
  useReadOnly,
  useSelected,
  withHOC,
} from "@udecode/plate/react";
import { motion } from "motion/react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  CombineIcon,
  Grid2X2Icon,
  SquareSplitHorizontalIcon,
  XIcon,
} from "lucide-react";

import { useState } from "react";
import { BorderAll, BorderBottom, BorderLeft, BorderNone, BorderRight, BorderTop } from "../icons/table-icons";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { ElementPopover, type ElementWidth, widthVariants } from "./element-popover";
import { PlateElement } from "./plate-element";
import { PopoverContent } from "./popover";
import { Separator } from "./separator";
import { Toolbar, ToolbarButton, ToolbarGroup } from "./toolbar";
import { ScrollArea } from "./scroll-area";
import { Caption, CaptionTextarea } from "./caption";

export const TableElement = withHOC(
  TableProvider,
  withRef<typeof PlateElement>(({ children, className, ...props }, ref) => {
    const readOnly = useReadOnly();
    const isSelectionAreaVisible = usePluginOption(BlockSelectionPlugin, "isSelectionAreaVisible");
    const hasControls = !readOnly && !isSelectionAreaVisible;
    const selected = useSelected();
    const { isSelectingCell, marginLeft, props: tableProps } = useTableElement();
    const element = useElement<TTableElement>();
    const [width, setWidth] = useState<ElementWidth>((element?.width as ElementWidth) || "column");
    const editor = useEditorRef();

    const handleWidth = (newWidth: ElementWidth) => {
      setWidth(newWidth);
      editor.tf.setNodes({ width: newWidth }, { at: element });
    };

    const content = (
      <PlateElement
        className={cn("relative my-8 flex flex-col items-center", className)}
        style={{ paddingLeft: marginLeft }}
        blockSelectionClassName={cn(hasControls && "left-2")}
        {...props}
      >
        <motion.figure
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
          <div
            className={cn(
              "w-full overflow-visible",
              // selected && "ring-2 ring-ring"
            )}
          >
            <div className="group/table relative w-full">
              <table
                ref={ref}
                className={cn(
                  "mr-0 ml-px table h-px w-full table-fixed border-collapse",
                  isSelectingCell && "selection:bg-transparent",
                )}
                {...tableProps}
              >
                <tbody className="min-w-full">{children}</tbody>
              </table>
            </div>
          </div>

          <Caption align="center" contentEditable={false}>
            <CaptionTextarea readOnly={readOnly} placeholder="Write a caption..." />
          </Caption>
        </motion.figure>
      </PlateElement>
    );

    if (readOnly || !selected) {
      return content;
    }

    return <TableFloatingToolbar initialWidth={width} onWidthChange={handleWidth}>{content}</TableFloatingToolbar>;
  }),
);

export const TableFloatingToolbar = withRef<
  typeof PopoverContent,
  { children: React.ReactNode; initialWidth: ElementWidth; onWidthChange?: (width: ElementWidth) => void }
>(({ children, initialWidth, onWidthChange, ...props }, ref) => {
  const { tf } = useEditorPlugin(TablePlugin);
  const element = useElement<TTableElement>();
  const [width, setWidth] = useState<ElementWidth>(initialWidth);
  const collapsed = useEditorSelector((editor) => !editor.api.isExpanded(), []);
  const { canMerge, canSplit } = useTableMergeState();
  const selected = useSelected();
  const readOnly = useReadOnly();

  const handleWidth = (newWidth: ElementWidth) => {
    setWidth(newWidth);
    onWidthChange?.(newWidth);
  };

  const tableContent = (
    <Toolbar className="flex flex-row items-center w-full">
      {canMerge && (
        <ToolbarButton
          variant="ghost"
          onClick={() => tf.table.merge()}
          onMouseDown={(e) => e.preventDefault()}
          tooltip="Merge cells"
          size="icon"
          className="h-10 w-10 p-0"
        >
          <CombineIcon className="h-3.5 w-3.5" />
        </ToolbarButton>
      )}
      {canSplit && (
        <ToolbarButton
          variant="ghost"
          onClick={() => tf.table.split()}
          onMouseDown={(e) => e.preventDefault()}
          tooltip="Split cell"
          size="icon"
          className="h-10 w-10 p-0"
        >
          <SquareSplitHorizontalIcon className="h-3.5 w-3.5" />
        </ToolbarButton>
      )}

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <ToolbarButton variant="ghost" tooltip="Cell borders" size="icon" className="h-10 w-10 p-0">
            <Grid2X2Icon className="h-3.5 w-3.5" />
          </ToolbarButton>
        </DropdownMenuTrigger>

        <DropdownMenuPortal>
          <TableBordersDropdownMenuContent />
        </DropdownMenuPortal>
      </DropdownMenu>

      {collapsed && (
        <>
          <Separator orientation="vertical" className="mx-1 h-6 bg-border" />
          <ToolbarButton
            variant="ghost"
            onClick={() => tf.insert.tableRow({ before: true })}
            onMouseDown={(e) => e.preventDefault()}
            tooltip="Insert row before"
            size="icon"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            variant="ghost"
            onClick={() => tf.insert.tableRow()}
            onMouseDown={(e) => e.preventDefault()}
            tooltip="Insert row after"
            size="icon"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            variant="ghost"
            onClick={() => tf.remove.tableRow()}
            onMouseDown={(e) => e.preventDefault()}
            tooltip="Delete row"
            size="icon"
          >
            <XIcon className="h-3.5 w-3.5" />
          </ToolbarButton>

          <Separator orientation="vertical" className="mx-1 h-6 bg-border" />

          <ToolbarButton
            variant="ghost"
            onClick={() => tf.insert.tableColumn({ before: true })}
            onMouseDown={(e) => e.preventDefault()}
            tooltip="Insert column before"
            size="icon"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            variant="ghost"
            onClick={() => tf.insert.tableColumn()}
            onMouseDown={(e) => e.preventDefault()}
            tooltip="Insert column after"
            size="icon"
          >
            <ArrowRight className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            variant="ghost"
            onClick={() => tf.remove.tableColumn()}
            onMouseDown={(e) => e.preventDefault()}
            tooltip="Delete column"
            size="icon"
          >
            <XIcon className="h-3.5 w-3.5" />
          </ToolbarButton>
        </>
      )}
    </Toolbar>
  );

  return (
    <ElementPopover
      ref={ref}
      open={!readOnly && selected && (canMerge || canSplit || collapsed)}
      defaultWidth={width}
      onWidthChange={handleWidth}
      verticalContent={tableContent}
      showCaption={true}
      sideOffset={5}
    >
      {children}
    </ElementPopover>
  );
});

export const TableBordersDropdownMenuContent = withRef<typeof DropdownMenuPrimitive.Content>((props, ref) => {
  const editor = useEditorRef();
  const {
    getOnSelectTableBorder,
    hasBottomBorder,
    hasLeftBorder,
    hasNoBorders,
    hasOuterBorders,
    hasRightBorder,
    hasTopBorder,
  } = useTableBordersDropdownMenuContentState();

  return (
    <DropdownMenuContent
      ref={ref}
      className={cn("min-w-[220px]")}
      onCloseAutoFocus={(e) => {
        e.preventDefault();
        editor.tf.focus();
      }}
      align="start"
      side="right"
      sideOffset={0}
      {...props}
    >
      <DropdownMenuGroup>
        <DropdownMenuCheckboxItem className="gap-2" checked={hasTopBorder} onCheckedChange={getOnSelectTableBorder("top")}>
          <BorderTop />
          <div>Top Border</div>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem className="gap-2" checked={hasRightBorder} onCheckedChange={getOnSelectTableBorder("right")}>
          <BorderRight />
          <div>Right Border</div>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem className="gap-2" checked={hasBottomBorder} onCheckedChange={getOnSelectTableBorder("bottom")}>
          <BorderBottom />
          <div>Bottom Border</div>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem className="gap-2" checked={hasLeftBorder} onCheckedChange={getOnSelectTableBorder("left")}>
          <BorderLeft />
          <div>Left Border</div>
        </DropdownMenuCheckboxItem>
      </DropdownMenuGroup>

      <DropdownMenuGroup>
        <DropdownMenuCheckboxItem className="gap-2" checked={hasNoBorders} onCheckedChange={getOnSelectTableBorder("none")}>
          <BorderNone />
          <div>No Border</div>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem className="gap-2" checked={hasOuterBorders} onCheckedChange={getOnSelectTableBorder("outer")}>
          <BorderAll />
          <div>Outside Borders</div>
        </DropdownMenuCheckboxItem>
      </DropdownMenuGroup>
    </DropdownMenuContent>
  );
});
