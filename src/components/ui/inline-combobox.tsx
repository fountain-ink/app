"use client";

import React, {
  type HTMLAttributes,
  type ReactNode,
  type RefObject,
  createContext,
  forwardRef,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { PointRef } from "slate";

import { cn, withCn } from "@udecode/cn";
import { filterWords } from "@udecode/plate-combobox";
import { type UseComboboxInputResult, useComboboxInput, useHTMLInputCursorState } from "@udecode/plate-combobox/react";
import { type TElement, createPointRef, getPointBefore, insertText, moveSelection } from "@udecode/plate-common";
import { findNodePath, useComposedRef, useEditorRef } from "@udecode/plate-common/react";
import { type VariantProps, cva } from "class-variance-authority";
import { AnimatePresence, motion } from "framer-motion";
import { ScrollArea } from "./scroll-area";

import { Ariakit } from "./menu";

const menuAnimationVariants = {
  hidden: {
    opacity: 0,
    height: 0,
    transition: {
      height: {
        duration: 0.2,
        ease: [0.32, 0.72, 0, 1],
      },
      opacity: {
        duration: 0.15,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  },
  visible: {
    opacity: 1,
    height: "auto",
    transition: {
      height: {
        duration: 0.2,
        ease: [0.32, 0.72, 0, 1],
      },
      opacity: {
        duration: 0.15,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  },
};

type FilterFn = (
  item: { value: string; group?: string; keywords?: string[]; label?: string },
  search: string,
) => boolean;

interface InlineComboboxContextValue {
  filter: FilterFn | false;
  inputProps: UseComboboxInputResult["props"];
  inputRef: RefObject<HTMLInputElement>;
  removeInput: UseComboboxInputResult["removeInput"];
  setHasEmpty: (hasEmpty: boolean) => void;
  showTrigger: boolean;
  trigger: string;
}

const InlineComboboxContext = createContext<InlineComboboxContextValue>(null as any);

export const defaultFilter: FilterFn = ({ group, keywords = [], label, value }, search) => {
  const uniqueTerms = new Set([value, ...keywords, group, label].filter(Boolean));

  return Array.from(uniqueTerms).some((keyword) => filterWords(keyword!, search));
};

interface InlineComboboxProps {
  children: ReactNode;
  element: TElement;
  trigger: string;
  filter?: FilterFn | false;
  hideWhenNoValue?: boolean;
  setValue?: (value: string) => void;
  showTrigger?: boolean;
  value?: string;
}

const InlineCombobox = ({
  children,
  element,
  filter = defaultFilter,
  hideWhenNoValue = false,
  setValue: setValueProp,
  showTrigger = true,
  trigger,
  value: valueProp,
}: InlineComboboxProps) => {
  const editor = useEditorRef();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const cursorState = useHTMLInputCursorState(inputRef);
  const [valueState, setValueState] = useState("");
  const hasValueProp = valueProp !== undefined;
  const value = hasValueProp ? valueProp : valueState;

  const setValue = useCallback(
    (newValue: string) => {
      setValueProp?.(newValue);

      if (!hasValueProp) {
        setValueState(newValue);
      }
    },
    [setValueProp, hasValueProp],
  );

  const [insertPoint, setInsertPoint] = useState<PointRef | null>(null);

  useEffect(() => {
    const path = findNodePath(editor, element);

    if (!path) return;

    const point = getPointBefore(editor, path);

    if (!point) return;

    const pointRef = createPointRef(editor, point);
    setInsertPoint(pointRef);

    return () => {
      pointRef.unref();
    };
  }, [editor, element]);

  const { props: inputProps, removeInput } = useComboboxInput({
    cancelInputOnBlur: true,
    cursorState,
    ref: inputRef,
    onCancelInput: (cause) => {
      if (cause !== "backspace") {
        insertText(editor, trigger + value, {
          at: insertPoint?.current ?? undefined,
        });
      }
      if (cause === "arrowLeft" || cause === "arrowRight") {
        moveSelection(editor, {
          distance: 1,
          reverse: cause === "arrowLeft",
        });
      }
    },
  });

  const [hasEmpty, setHasEmpty] = useState(false);

  const contextValue: InlineComboboxContextValue = useMemo(
    () => ({
      filter,
      inputProps,
      inputRef,
      removeInput,
      setHasEmpty,
      showTrigger,
      trigger,
    }),
    [trigger, showTrigger, filter, inputRef, inputProps, removeInput, setHasEmpty],
  );

  const store = Ariakit.useComboboxStore({
    setValue: (newValue) => startTransition(() => setValue(newValue)),
  });

  const items = store.useState("items");

  useEffect(() => {
    if (!store.getState().activeId) {
      store.setActiveId(store.first());
    }
  }, [items, store]);

  const selected = editor.children[editor?.selection?.anchor.path[0] ?? 0];
  const isOnTitle = selected?.type === "h1";
  const isOnSubtitle = selected?.type === "h2";
  const isOnCodeblock = selected?.type === "code_block";

  if (isOnTitle || isOnSubtitle || isOnCodeblock) {
    return <>{trigger}</>;
  }

  return (
    <span contentEditable={false}>
      <Ariakit.ComboboxProvider
        open={(items.length > 0 || hasEmpty) && (!hideWhenNoValue || value.length > 0)}
        store={store}
      >
        <InlineComboboxContext.Provider value={contextValue}>{children}</InlineComboboxContext.Provider>
      </Ariakit.ComboboxProvider>
    </span>
  );
};

const InlineComboboxInput = forwardRef<HTMLInputElement, HTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, propRef) => {
    const { inputProps, inputRef: contextRef, showTrigger, trigger } = useContext(InlineComboboxContext);

    const store = Ariakit.useComboboxContext()!;
    const value = store.useState("value");

    const ref = useComposedRef(propRef, contextRef);

    return (
      <>
        {showTrigger && trigger}

        <span className="relative min-h-[1lh]">
          <span className="invisible overflow-hidden text-nowrap" aria-hidden="true">
            {value || "\u200B"}
          </span>

          <Ariakit.Combobox
            ref={ref}
            className={cn("absolute left-0 top-0 size-full bg-transparent outline-none", className)}
            value={value}
            autoSelect
            {...inputProps}
            {...props}
          />
        </span>
      </>
    );
  },
);

InlineComboboxInput.displayName = "InlineComboboxInput";

const comboboxVariants = cva(
  "z-[500] mt-1 min-w-[180px] max-w-[calc(100vw-24px)] backdrop-blur-md bg-popover/80 border border-border/50 shadow-lg shadow-black/10 rounded-lg",
  {
    defaultVariants: {
      variant: "default",
    },
    variants: {
      variant: {
        default: "",
        emoji: "max-h-[270px] w-[408px]",
        mention: "w-[400px]",
        slash: "w-[320px]",
      },
    },
  },
);

const InlineComboboxContent = ({
  className,
  variant,
  ...props
}: Ariakit.ComboboxPopoverProps & VariantProps<typeof comboboxVariants>) => {
  return (
    <Ariakit.Portal>
      <AnimatePresence>
        <Ariakit.ComboboxPopover {...props}>
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={menuAnimationVariants}
            style={{
              transformOrigin: "top",
              willChange: "transform, opacity, height",
            }}
            className={cn(comboboxVariants({ variant }), className)}
          >
            <motion.div
              layout
              transition={{
                layout: {
                  duration: 0.2,
                  ease: [0.32, 0.72, 0, 1],
                },
              }}
              className="overflow-hidden"
            >
              <ScrollArea className="h-full max-h-[40vh]">
                <motion.div
                  layout="position"
                  transition={{
                    layout: {
                      duration: 0.2,
                      ease: [0.32, 0.72, 0, 1],
                    },
                  }}
                  className="flex flex-col gap-1 py-1 max-h-[40vh]"
                >
                  {props.children}
                </motion.div>
              </ScrollArea>
            </motion.div>
          </motion.div>
        </Ariakit.ComboboxPopover>
      </AnimatePresence>
    </Ariakit.Portal>
  );
};

const comboboxItemVariants = cva(
  "relative mx-1 flex select-none items-center rounded-sm px-2 py-1 text-sm text-foreground outline-none transition-bg-ease",
  {
    defaultVariants: {
      interactive: true,
    },
    variants: {
      interactive: {
        false: "",
        true: "cursor-pointer hover:bg-accent hover:text-accent-foreground data-[active-item=true]:bg-accent data-[active-item=true]:text-accent-foreground",
      },
    },
  },
);

export type InlineComboboxItemProps = {
  focusEditor?: boolean;
  group?: string;
  keywords?: string[];
  label?: string;
} & Ariakit.ComboboxItemProps &
  Required<Pick<Ariakit.ComboboxItemProps, "value">>;

const InlineComboboxItem = ({
  className,
  focusEditor = true,
  group,
  keywords,
  label,
  onClick,
  ...props
}: InlineComboboxItemProps) => {
  const { value } = props;

  const { filter, removeInput } = useContext(InlineComboboxContext);

  const store = Ariakit.useComboboxContext()!;

  const search = filter && store.useState("value");

  const visible = useMemo(
    () => !filter || filter({ group, keywords, label, value }, search as string),
    [filter, group, keywords, value, label, search],
  );

  if (!visible) return null;

  return (
    <Ariakit.ComboboxItem
      className={cn(comboboxItemVariants(), className)}
      onClick={(event) => {
        removeInput(focusEditor);
        onClick?.(event);
      }}
      {...props}
    />
  );
};

const InlineComboboxEmpty = ({ children, className }: HTMLAttributes<HTMLDivElement>) => {
  const { setHasEmpty } = useContext(InlineComboboxContext);
  const store = Ariakit.useComboboxContext()!;
  const items = store.useState("items");

  useEffect(() => {
    setHasEmpty(true);

    return () => {
      setHasEmpty(false);
    };
  }, [setHasEmpty]);

  if (items.length > 0) return null;

  return (
    <div className={cn(comboboxItemVariants({ interactive: false }), "my-1.5 text-muted-foreground", className)}>
      {children}
    </div>
  );
};

const InlineComboboxRow = Ariakit.ComboboxRow;
const InlineComboboxGroup = withCn(
  Ariakit.ComboboxGroup,
  "hidden py-1.5 [&:has([role=option])]:block [&:not(:last-child)]:border-b",
);

const InlineComboboxGroupLabel = withCn(
  Ariakit.ComboboxGroupLabel,
  "mb-2 mt-1.5 px-3 text-xs font-medium text-muted-foreground",
);

export {
  InlineCombobox,
  InlineComboboxContent,
  InlineComboboxEmpty,
  InlineComboboxGroup,
  InlineComboboxGroupLabel,
  InlineComboboxInput,
  InlineComboboxItem,
  InlineComboboxRow,
};
