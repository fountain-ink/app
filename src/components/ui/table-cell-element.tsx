// "use client";

// import { cn, withProps, withRef } from "@udecode/cn";
// import {
//   useTableCellElement,
//   useTableCellElementResizable,
// } from "@udecode/plate-table/react";

// import { PlateElement } from "./plate-element";
// import { ResizeHandle } from "./resizable";

// export const TableCellElement = withRef<
//   typeof PlateElement,
//   {
//     hideBorder?: boolean;
//     isHeader?: boolean;
//   }
// >(({ children, className, hideBorder, isHeader, style, ...props }, ref) => {
//   const { element } = props;

//   const { borders, colIndex, colSpan, hovered, hoveredLeft, isSelectingCell, readOnly, rowIndex, rowSize, selected } =
//     useTableCellElementState();
//   const { props: cellProps } = useTableCellElement({ element: props.element });
//   const resizableState = useTableCellElementResizableState({
//     colIndex,
//     colSpan,
//     rowIndex,
//   });

//   const { bottomProps, hiddenLeft, leftProps, rightProps } = useTableCellElementResizable(resizableState);

//   return (
//     <PlateElement
//       ref={ref}
//       as={isHeader ? "th" : "td"}
//       className={cn(
//         "relative h-full overflow-visible border-none bg-background p-0",
//         hideBorder && "before:border-none",
//         element.background ? "bg-[--cellBackground]" : "bg-background",
//         !hideBorder &&
//           cn(
//             isHeader && "text-left [&_>_*]:m-0",
//             "before:size-full",
//             selected && "before:z-10 before:bg-muted",
//             "before:absolute before:box-border before:select-none before:content-['']",
//             borders &&
//               cn(
//                 borders.bottom?.size && "before:border-b-2 before:border-b-border",
//                 borders.right?.size && "before:border-r-2 before:border-r-border",
//                 borders.left?.size && "before:border-l-2 before:border-l-border",
//                 borders.top?.size && "before:border-t-2 before:border-t-border",
//               ),
//           ),
//         className,
//       )}
//       {...cellProps}
//       {...props}
//       style={
//         {
//           "--cellBackground": element.background,
//           ...style,
//         } as React.CSSProperties
//       }
//     >
//       <div
//         className="relative z-20 box-border h-full px-3 py-2"
//         style={{
//           minHeight: rowSize,
//         }}
//       >
//         {children}
//       </div>

//       {!isSelectingCell && (
//         <div
//           className="group absolute top-0 size-full select-none"
//           contentEditable={false}
//           suppressContentEditableWarning={true}
//         >
//           {!readOnly && (
//             <>
//               <ResizeHandle {...rightProps} className="-top-3 right-[-5px] w-[10px]" />
//               <ResizeHandle {...bottomProps} className="bottom-[-5px] h-[10px]" />
//               {!hiddenLeft && <ResizeHandle {...leftProps} className="-top-3 left-[-5px] w-[10px]" />}

//               {hovered && (
//                 <div className={cn("absolute -top-3 z-30 h-[calc(100%_+_12px)] w-1 bg-ring", "right-[-1.5px]")} />
//               )}
//               {hoveredLeft && (
//                 <div className={cn("absolute -top-3 z-30 h-[calc(100%_+_12px)] w-1 bg-ring", "left-[-1.5px]")} />
//               )}
//             </>
//           )}
//         </div>
//       )}
//     </PlateElement>
//   );
// });

// TableCellElement.displayName = "TableCellElement";

// export const TableCellHeaderElement = withProps(TableCellElement, {
//   isHeader: true,
// });

'use client';

import React from 'react';

import type { TTableCellElement } from '@udecode/plate-table';

import { cn, withProps, withRef } from '@udecode/cn';
import { useBlockSelected } from '@udecode/plate-selection/react';
import {
  TablePlugin,
  TableRowPlugin,
  useTableCellElement,
  useTableCellElementResizable,
} from '@udecode/plate-table/react';
import {
  useEditorPlugin,
  useElementSelector,
  useReadOnly,
} from '@udecode/plate/react';
import { cva } from 'class-variance-authority';

import { blockSelectionVariants } from './block-selection';
import { PlateElement } from './plate-element';
import { ResizeHandle } from './resizable';

export const TableCellElement = withRef<
  typeof PlateElement,
  {
    isHeader?: boolean;
  }
>(({ children, className, isHeader, style, ...props }, ref) => {
  const { api } = useEditorPlugin(TablePlugin);
  const readOnly = useReadOnly();
  const element = props.element as TTableCellElement;

  const rowId = useElementSelector(([node]) => node.id as string, [], {
    key: TableRowPlugin.key,
  });
  const isSelectingRow = useBlockSelected(rowId);

  const {
    borders,
    colIndex,
    colSpan,
    isSelectingCell,
    minHeight,
    rowIndex,
    selected,
    width,
  } = useTableCellElement();

  const { bottomProps, hiddenLeft, leftProps, rightProps } =
    useTableCellElementResizable({
      colIndex,
      colSpan,
      rowIndex,
    });

  return (
    <PlateElement
      ref={ref}
      as={isHeader ? 'th' : 'td'}
      className={cn(
        className,
        'h-full overflow-visible border-none bg-background p-0',
        element.background ? 'bg-(--cellBackground)' : 'bg-background',
        isHeader && 'text-left *:m-0',
        'before:size-full',
        selected && 'before:z-10 before:bg-muted',
        "before:absolute before:box-border before:content-[''] before:select-none",
        borders.bottom?.size && 'before:border-b before:border-b-border',
        borders.right?.size && 'before:border-r before:border-r-border',
        borders.left?.size && 'before:border-l before:border-l-border',
        borders.top?.size && 'before:border-t before:border-t-border'
      )}
      style={
        {
          '--cellBackground': element.background,
          maxWidth: width || 240,
          minWidth: width || 120,
          ...style,
        } as React.CSSProperties
      }
      {...{
        colSpan: api.table.getColSpan(element),
        rowSpan: api.table.getRowSpan(element),
      }}
      {...props}
    >
      <div
        className="relative z-20 box-border h-full px-4 py-2"
        style={{ minHeight }}
      >
        {children}
      </div>

      {!isSelectingCell && (
        <div
          className="group absolute top-0 size-full select-none"
          contentEditable={false}
          suppressContentEditableWarning={true}
        >
          {!readOnly && (
            <>
              <ResizeHandle
                {...rightProps}
                className="-top-2 -right-1 h-[calc(100%_+_8px)] w-2"
                data-col={colIndex}
              />
              <ResizeHandle {...bottomProps} className="-bottom-1 h-2" />
              {!hiddenLeft && (
                <ResizeHandle
                  {...leftProps}
                  className="top-0 -left-1 w-2"
                  data-resizer-left={colIndex === 0 ? 'true' : undefined}
                />
              )}

              <div
                className={cn(
                  'absolute top-0 z-30 hidden h-full w-1 bg-ring',
                  'right-[-1.5px]',
                  columnResizeVariants({ colIndex: colIndex as any })
                )}
              />
              {colIndex === 0 && (
                <div
                  className={cn(
                    'absolute top-0 z-30 h-full w-1 bg-ring',
                    'left-[-1.5px]',
                    'fade-in hidden animate-in group-has-[[data-resizer-left]:hover]/table:block group-has-[[data-resizer-left][data-resizing="true"]]/table:block'
                  )}
                />
              )}
            </>
          )}
        </div>
      )}

      {isSelectingRow && (
        <div className={blockSelectionVariants()} contentEditable={false} />
      )}
    </PlateElement>
  );
});

TableCellElement.displayName = 'TableCellElement';

export const TableCellHeaderElement = withProps(TableCellElement, {
  isHeader: true,
});

const columnResizeVariants = cva('hidden animate-in fade-in', {
  variants: {
    colIndex: {
      0: 'group-has-[[data-col="0"]:hover]/table:block group-has-[[data-col="0"][data-resizing="true"]]/table:block',
      1: 'group-has-[[data-col="1"]:hover]/table:block group-has-[[data-col="1"][data-resizing="true"]]/table:block',
      2: 'group-has-[[data-col="2"]:hover]/table:block group-has-[[data-col="2"][data-resizing="true"]]/table:block',
      3: 'group-has-[[data-col="3"]:hover]/table:block group-has-[[data-col="3"][data-resizing="true"]]/table:block',
      4: 'group-has-[[data-col="4"]:hover]/table:block group-has-[[data-col="4"][data-resizing="true"]]/table:block',
      5: 'group-has-[[data-col="5"]:hover]/table:block group-has-[[data-col="5"][data-resizing="true"]]/table:block',
      6: 'group-has-[[data-col="6"]:hover]/table:block group-has-[[data-col="6"][data-resizing="true"]]/table:block',
      7: 'group-has-[[data-col="7"]:hover]/table:block group-has-[[data-col="7"][data-resizing="true"]]/table:block',
      8: 'group-has-[[data-col="8"]:hover]/table:block group-has-[[data-col="8"][data-resizing="true"]]/table:block',
      9: 'group-has-[[data-col="9"]:hover]/table:block group-has-[[data-col="9"][data-resizing="true"]]/table:block',
      10: 'group-has-[[data-col="10"]:hover]/table:block group-has-[[data-col="10"][data-resizing="true"]]/table:block',
    },
  },
});