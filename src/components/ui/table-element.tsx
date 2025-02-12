// "use client";

// import type * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
// import { deleteColumn, deleteRow, mergeTableCells, splitTableCell, type TTableElement } from "@udecode/plate-table";

// import { PopoverAnchor } from "@radix-ui/react-popover";
// import { cn, withRef } from "@udecode/cn";
// import {
//   PlateElement,
//   useEditorPlugin,
//   useElement,
//   useRemoveNodeButton,
//   useSelectionCollapsed,
//   withHOC,
// } from "@udecode/plate/react";
// import {
//   TablePlugin,
//   TableProvider,
//   useTableBordersDropdownMenuContentState,
//   useTableElement,
//   useTableMergeState,
// } from "@udecode/plate-table/react";

// import type { LucideProps } from "lucide-react";
// import { useReadOnly, useSelected } from "@udecode/plate/react";

// import { Minus, Plus } from "lucide-react";
// import { Button } from "./button";
// import {
//   DropdownMenu,
//   DropdownMenuCheckboxItem,
//   DropdownMenuContent,
//   DropdownMenuPortal,
//   DropdownMenuTrigger,
// } from "./dropdown-menu";
// import { Popover, PopoverContent, popoverVariants } from "./popover";
// import { Separator } from "./separator";

// interface QuantityControlProps {
//   label: string;
//   onDecrease: () => void;
//   onIncrease: () => void;
// }

// interface QuantityControlProps {
//   label: string;
//   onDecrease: () => void;
//   onIncrease: () => void;
// }

// const QuantityControl: React.FC<QuantityControlProps> = ({ label, onDecrease, onIncrease }) => {
//   return (
//     <div className="flex items-center gap-1">
//       <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onDecrease}>
//         <Minus className="h-4 w-4" />
//       </Button>
//       <span className="min-w-[2rem] text-center text-sm">{label}</span>
//       <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onIncrease}>
//         <Plus className="h-4 w-4" />
//       </Button>
//     </div>
//   );
// };

// export const TableBordersDropdownMenuContent = withRef<typeof DropdownMenuPrimitive.Content>((props, ref) => {
//   const {
//     getOnSelectTableBorder,
//     hasBottomBorder,
//     hasLeftBorder,
//     hasNoBorders,
//     hasOuterBorders,
//     hasRightBorder,
//     hasTopBorder,
//   } = useTableBordersDropdownMenuContentState();

//   return (
//     <DropdownMenuContent ref={ref} className={cn("min-w-[220px]")} align="start" side="right" sideOffset={5} {...props}>
//       <DropdownMenuCheckboxItem
//         className="flex gap-1 pl-10"
//         checked={hasBottomBorder}
//         onCheckedChange={getOnSelectTableBorder("bottom")}
//       >
//         <BorderBottom />
//         <div>Bottom Border</div>
//       </DropdownMenuCheckboxItem>
//       <DropdownMenuCheckboxItem
//         className="flex gap-1 pl-10"
//         checked={hasTopBorder}
//         onCheckedChange={getOnSelectTableBorder("top")}
//       >
//         <BorderTop />
//         <div>Top Border</div>
//       </DropdownMenuCheckboxItem>
//       <DropdownMenuCheckboxItem
//         className="flex gap-1 pl-10"
//         checked={hasLeftBorder}
//         onCheckedChange={getOnSelectTableBorder("left")}
//       >
//         <BorderLeft />
//         <div>Left Border</div>
//       </DropdownMenuCheckboxItem>
//       <DropdownMenuCheckboxItem
//         className="flex gap-1 pl-10"
//         checked={hasRightBorder}
//         onCheckedChange={getOnSelectTableBorder("right")}
//       >
//         <BorderRight />
//         <div>Right Border</div>
//       </DropdownMenuCheckboxItem>

//       <Separator />

//       <DropdownMenuCheckboxItem
//         className="flex gap-1 pl-10"
//         checked={hasNoBorders}
//         onCheckedChange={getOnSelectTableBorder("none")}
//       >
//         <BorderNone />
//         <div>No Border</div>
//       </DropdownMenuCheckboxItem>
//       <DropdownMenuCheckboxItem
//         className="flex gap-1 pl-10"
//         checked={hasOuterBorders}
//         onCheckedChange={getOnSelectTableBorder("outer")}
//       >
//         <BorderAll />
//         <div>Outside Borders</div>
//       </DropdownMenuCheckboxItem>
//     </DropdownMenuContent>
//   );
// });

// export const TableFloatingToolbar = withRef<typeof PopoverContent>(({ children, ...props }, ref) => {
//   const element = useElement<TTableElement>();
//   const { props: buttonProps } = useRemoveNodeButton({ element });
//   const selectionCollapsed = useSelectionCollapsed();

//   const readOnly = useReadOnly();
//   const selected = useSelected();
//   const { editor, tf } = useEditorPlugin(TablePlugin);

//   const collapsed = !readOnly && selected && selectionCollapsed;
//   const open = !readOnly && selected;

//   const handleAddColumn = () => {
//     tf.insert.tableColumn();
//   };

//   const handleRemoveColumn = () => {
//     deleteColumn(editor);
//   };

//   const handleAddRow = () => {
//     tf.insert.tableRow();
//   };

//   const handleRemoveRow = () => {
//     deleteRow(editor);
//   };

//   const { canMerge, canSplit } = useTableMergeState();

//   const mergeContent = canMerge && (
//     <Button variant="ghost" onClick={() => mergeTableCells(editor)} contentEditable={false} isMenu>
//       Merge
//     </Button>
//   );

//   const unmergeButton = canSplit && (
//     <Button variant="ghost" onClick={() => splitTableCell(editor)} contentEditable={false} isMenu>
//       Unmerge
//     </Button>
//   );

//   const bordersContent = collapsed && (
//     <>
//       <DropdownMenu modal={false}>
//         <DropdownMenuTrigger asChild>
//           <Button variant="ghost" isMenu>
//             Borders
//           </Button>
//         </DropdownMenuTrigger>

//         <DropdownMenuPortal>
//           <TableBordersDropdownMenuContent />
//         </DropdownMenuPortal>
//       </DropdownMenu>

//       <Button variant="ghost" contentEditable={false} isMenu {...buttonProps}>
//         Remove
//       </Button>
//     </>
//   );

//   return (
//     <Popover open={open} modal={false}>
//       <PopoverAnchor asChild>{children}</PopoverAnchor>
//       {(canMerge || canSplit || collapsed) && (
//         <PopoverContent
//           ref={ref}
//           className={cn(popoverVariants(), "flex w-fit flex-row gap-2 p-1")}
//           onOpenAutoFocus={(e) => e.preventDefault()}
//           {...props}
//         >
//           <div className="flex items-center gap-2 border-r pr-2">
//             <QuantityControl label={"Cols"} onDecrease={handleRemoveColumn} onIncrease={handleAddColumn} />
//             <QuantityControl label={"Rows"} onDecrease={handleRemoveRow} onIncrease={handleAddRow} />
//           </div>

//           {unmergeButton}
//           {mergeContent}
//           {bordersContent}
//         </PopoverContent>
//       )}
//     </Popover>
//   );
// });

// export const TableElement = withHOC(
//   TableProvider,
//   withRef<typeof PlateElement>(({ children, className, ...props }, ref) => {
//     const { colSizes, isSelectingCell, marginLeft, minColumnWidth } = useTableElementState();
//     const {
//           isSelectingCell,
//           marginLeft,
//           props: tableProps,
//         } = useTableElement();

//     return (
//       <TableFloatingToolbar>
//         <div style={{ paddingLeft: marginLeft }}>
//           <PlateElement
//             ref={ref}
//             as="table"
//             className={cn(
//               "relative my-4 ml-px mr-0 table h-px w-full table-fixed border-collapse",
//               isSelectingCell && "[&_*::selection]:bg-none",
//               className,
//             )}
//             {...tableProps}
//             {...props}
//           >
//             <colgroup {...colGroupProps}>
//               {colSizes.map((width, index) => (
//                 <col
//                   key={`${index}-${width}`}
//                   style={{
//                     minWidth: minColumnWidth,
//                     width: width || undefined,
//                   }}
//                 />
//               ))}
//             </colgroup>

//             <tbody className="min-w-full">{children}</tbody>
//           </PlateElement>
//         </div>
//       </TableFloatingToolbar>
//     );
//   }),
// );

// export const BorderBottom = (props: LucideProps) => (
//   <svg
//     fill="currentColor"
//     focusable="false"
//     height="20"
//     role="img"
//     viewBox="0 0 24 24"
//     width="20"
//     xmlns="http://www.w3.org/2000/svg"
//     {...props}
//   >
//     <path d="M13 5a1 1 0 1 0 0-2h-2a1 1 0 1 0 0 2h2zm-8 6a1 1 0 1 0-2 0v2a1 1 0 1 0 2 0v-2zm-2 7a1 1 0 1 1 2 0 1 1 0 0 0 1 1h12a1 1 0 0 0 1-1 1 1 0 1 1 2 0 3 3 0 0 1-3 3H6a3 3 0 0 1-3-3zm17-8a1 1 0 0 0-1 1v2a1 1 0 1 0 2 0v-2a1 1 0 0 0-1-1zM7 4a1 1 0 0 0-1-1 3 3 0 0 0-3 3 1 1 0 0 0 2 0 1 1 0 0 1 1-1 1 1 0 0 0 1-1zm11-1a1 1 0 1 0 0 2 1 1 0 0 1 1 1 1 1 0 1 0 2 0 3 3 0 0 0-3-3z" />
//   </svg>
// );

// export const BorderTop = (props: LucideProps) => (
//   <svg
//     fill="currentColor"
//     focusable="false"
//     height="20"
//     role="img"
//     viewBox="0 0 24 24"
//     width="20"
//     xmlns="http://www.w3.org/2000/svg"
//     {...props}
//   >
//     <path d="M3 6a1 1 0 0 0 2 0 1 1 0 0 1 1-1h12a1 1 0 0 1 1 1 1 1 0 1 0 2 0 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3zm2 5a1 1 0 1 0-2 0v2a1 1 0 1 0 2 0v-2zm14 0a1 1 0 1 1 2 0v2a1 1 0 1 1-2 0v-2zm-5 9a1 1 0 0 1-1 1h-2a1 1 0 1 1 0-2h2a1 1 0 0 1 1 1zm-8 1a1 1 0 1 0 0-2 1 1 0 0 1-1-1 1 1 0 1 0-2 0 3 3 0 0 0 3 3zm11-1a1 1 0 0 0 1 1 3 3 0 0 0 3-3 1 1 0 1 0-2 0 1 1 0 0 1-1 1 1 1 0 0 0-1 1z" />
//   </svg>
// );

// export const BorderLeft = (props: LucideProps) => (
//   <svg
//     fill="currentColor"
//     focusable="false"
//     height="20"
//     role="img"
//     viewBox="0 0 24 24"
//     width="20"
//     xmlns="http://www.w3.org/2000/svg"
//     {...props}
//   >
//     <path d="M6 21a1 1 0 1 0 0-2 1 1 0 0 1-1-1V6a1 1 0 0 1 1-1 1 1 0 0 0 0-2 3 3 0 0 0-3 3v12a3 3 0 0 0 3 3zm7-16a1 1 0 1 0 0-2h-2a1 1 0 1 0 0 2h2zm6 6a1 1 0 1 1 2 0v2a1 1 0 1 1-2 0v-2zm-5 9a1 1 0 0 1-1 1h-2a1 1 0 1 1 0-2h2a1 1 0 0 1 1 1zm4-17a1 1 0 1 0 0 2 1 1 0 0 1 1 1 1 1 0 1 0 2 0 3 3 0 0 0-3-3zm-1 17a1 1 0 0 0 1 1 3 3 0 0 0 3-3 1 1 0 1 0-2 0 1 1 0 0 1-1 1 1 1 0 0 0-1 1z" />
//   </svg>
// );

// export const BorderRight = (props: LucideProps) => (
//   <svg
//     fill="currentColor"
//     focusable="false"
//     height="20"
//     role="img"
//     viewBox="0 0 24 24"
//     width="20"
//     xmlns="http://www.w3.org/2000/svg"
//     {...props}
//   >
//     <path d="M13 5a1 1 0 1 0 0-2h-2a1 1 0 1 0 0 2h2zm-8 6a1 1 0 1 0-2 0v2a1 1 0 1 0 2 0v-2zm9 9a1 1 0 0 1-1 1h-2a1 1 0 1 1 0-2h2a1 1 0 0 1 1 1zM6 3a1 1 0 0 1 0 2 1 1 0 0 0-1 1 1 1 0 0 1-2 0 3 3 0 0 1 3-3zm1 17a1 1 0 0 1-1 1 3 3 0 0 1-3-3 1 1 0 1 1 2 0 1 1 0 0 0 1 1 1 1 0 0 1 1 1zm11 1a1 1 0 1 1 0-2 1 1 0 0 0 1-1V6a1 1 0 0 0-1-1 1 1 0 1 1 0-2 3 3 0 0 1 3 3v12a3 3 0 0 1-3 3z" />
//   </svg>
// );

// export const BorderAll = (props: LucideProps) => (
//   <svg
//     fill="currentColor"
//     focusable="false"
//     height="20"
//     role="img"
//     viewBox="0 0 24 24"
//     width="20"
//     xmlns="http://www.w3.org/2000/svg"
//     {...props}
//   >
//     <path d="M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6zm10 13h5a1 1 0 0 0 1-1v-5h-6v6zm-2-6H5v5a1 1 0 0 0 1 1h5v-6zm2-2h6V6a1 1 0 0 0-1-1h-5v6zm-2-6H6a1 1 0 0 0-1 1v5h6V5z" />
//   </svg>
// );

// export const BorderNone = (props: LucideProps) => (
//   <svg
//     fill="currentColor"
//     focusable="false"
//     height="20"
//     role="img"
//     viewBox="0 0 24 24"
//     width="20"
//     xmlns="http://www.w3.org/2000/svg"
//     {...props}
//   >
//     <path d="M14 4a1 1 0 0 1-1 1h-2a1 1 0 1 1 0-2h2a1 1 0 0 1 1 1zm-9 7a1 1 0 1 0-2 0v2a1 1 0 1 0 2 0v-2zm14 0a1 1 0 1 1 2 0v2a1 1 0 1 1-2 0v-2zm-6 10a1 1 0 1 0 0-2h-2a1 1 0 1 0 0 2h2zM7 4a1 1 0 0 0-1-1 3 3 0 0 0-3 3 1 1 0 0 0 2 0 1 1 0 0 1 1-1 1 1 0 0 0 1-1zm11-1a1 1 0 1 0 0 2 1 1 0 0 1 1 1 1 1 0 1 0 2 0 3 3 0 0 0-3-3zM7 20a1 1 0 0 1-1 1 3 3 0 0 1-3-3 1 1 0 1 1 2 0 1 1 0 0 0 1 1 1 1 0 0 1 1 1zm11 1a1 1 0 1 1 0-2 1 1 0 0 0 1-1 1 1 0 1 1 2 0 3 3 0 0 1-3 3z" />
//   </svg>
// );

"use client";

import { cn, withRef } from "@udecode/cn";
import { TablePlugin, TableProvider, useTableElement } from "@udecode/plate-table/react";
import { useEditorPlugin, useReadOnly, withHOC } from "@udecode/plate/react";
import { PlusIcon } from "lucide-react";

import { Button } from "./button";
import { PlateElement } from "./plate-element";

export const TableElement = withHOC(
  TableProvider,
  withRef<typeof PlateElement>(({ children, className, ...props }, ref) => {
    const { editor, element } = props;
    const { tf } = useEditorPlugin(TablePlugin);
    const readOnly = useReadOnly();
    const { isSelectingCell, marginLeft, props: tableProps } = useTableElement();

    const content = (
      <PlateElement className={cn(className, "overflow-x-auto py-5")} style={{ paddingLeft: marginLeft }} {...props}>
        <div className="group/table relative w-fit">
          <table
            ref={ref}
            className={cn(
              "mr-0 ml-px table h-px table-fixed border-collapse",
              isSelectingCell && "selection:bg-transparent",
            )}
            {...tableProps}
          >
            <tbody className="min-w-full">{children}</tbody>
          </table>

          {!readOnly && (
            <>
              <div
                className={cn(
                  "absolute inset-x-0 bottom-[-18px] flex flex-row opacity-0 transition-opacity hover:opacity-100",
                  "group-has-[tr:last-child:hover]/table:opacity-100 max-sm:group-has-[tr[data-selected]:last-child]/table:opacity-100",
                )}
              >
                <Button
                  size="none"
                  variant="ghost"
                  className={cn("flex h-4 w-full grow items-center justify-center bg-muted")}
                  onClick={() => tf.insert.tableRow({ at: editor.api.findPath(element) })}
                  onMouseDown={(e) => e.preventDefault()}
                  tooltip="Add a new row"
                  tooltipContentProps={{ side: "bottom" }}
                >
                  <PlusIcon className="size-3.5! text-muted-foreground" />
                </Button>
              </div>

              <div
                className={cn(
                  "absolute inset-y-0 right-[-18px] flex opacity-0 transition-opacity hover:opacity-100",
                  "group-has-[td:last-child:hover,th:last-child:hover]/table:opacity-100 max-sm:group-has-[td[data-selected]:last-child,th[data-selected]:last-child]/table:opacity-100",
                )}
              >
                <Button
                  size="none"
                  variant="ghost"
                  className={cn("flex h-full w-4 grow items-center justify-center bg-muted")}
                  onClick={() =>
                    tf.insert.tableColumn({
                      at: editor.api.findPath(element),
                    })
                  }
                  onMouseDown={(e) => e.preventDefault()}
                  tooltip="Add a new column"
                  tooltipContentProps={{ side: "bottom" }}
                >
                  <PlusIcon className="size-3.5! text-muted-foreground" />
                </Button>
              </div>

              <div
                className={cn(
                  "absolute right-[-18px] bottom-[-18px] flex flex-row opacity-0 transition-opacity hover:opacity-100",
                  "group-has-[td:last-child:hover,th:last-child:hover]/table:group-has-[tr:last-child:hover]/table:opacity-100 max-sm:group-has-[td[data-selected]:last-child,th[data-selected]:last-child]/table:group-has-[tr[data-selected]:last-child]/table:opacity-100",
                )}
              >
                <Button
                  size="none"
                  variant="ghost"
                  className={cn("flex size-4 items-center justify-center rounded-full bg-muted")}
                  onClick={() => {
                    editor.tf.withoutNormalizing(() => {
                      tf.insert.tableRow({ at: editor.api.findPath(element) });
                      tf.insert.tableColumn({
                        at: editor.api.findPath(element),
                      });
                    });
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  tooltip="Add a new row and column"
                  tooltipContentProps={{ side: "bottom" }}
                >
                  <PlusIcon className="size-3.5! text-muted-foreground" />
                </Button>
              </div>
            </>
          )}
        </div>
      </PlateElement>
    );

    return content;
  }),
);
