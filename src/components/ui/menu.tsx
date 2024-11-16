"use client";

import * as React from "react";

import * as Ariakit from "@ariakit/react";
import { cn, createPrimitiveElement, useComposedRef, withRef, withVariants } from "@udecode/cn";
import { type VariantProps, cva } from "class-variance-authority";
import { CornerDownLeft } from "lucide-react";

import { useOnClickOutside } from "@/hooks/use-on-click-outside";

export type Action = {
  filterItems?: boolean;
  focusEditor?: boolean;
  group?: string;
  icon?: React.ReactNode;
  items?: Action[];
  keywords?: string[];
  label?: string;
  shortcut?: string;
  value?: string;
};

export type ActionGroup = {
  group?: string;
  value?: string;
};

const SearchableContext = React.createContext(false);

const MenuContext = React.createContext<{
  isRootMenu: boolean;
  open: boolean;
}>({
  isRootMenu: false,
  open: false,
});

export type MenuProps = Ariakit.MenuProviderProps & {
  trigger?: React.ReactNode;
  value?: string;
  onOpenChange?: Ariakit.MenuProviderProps["setOpen"];
  onRootMenuClose?: () => void;
  onValueChange?: Ariakit.ComboboxProviderProps["setValue"];
  onValuesChange?: Ariakit.MenuProviderProps["setValues"];
};

export const Menu = ({
  children,
  trigger,
  value,
  onOpenChange,
  onRootMenuClose,
  onValueChange = () => {},
  onValuesChange,
  ...props
}: MenuProps) => {
  const isRootMenu = !Ariakit.useMenuContext();
  const [open, setOpen] = React.useState(false);

  const searchable = !!onValuesChange || isRootMenu;

  const content = (
    <Ariakit.MenuProvider
      open={open}
      setOpen={(v) => {
        if (props.open === undefined) {
          setOpen(v);
        }

        onOpenChange?.(v);
      }}
      setValues={onValuesChange}
      showTimeout={100}
      {...props}
    >
      {trigger}

      <MenuContext.Provider value={{ isRootMenu, open: props.open ?? open }}>
        <SearchableContext.Provider value={searchable}>{children}</SearchableContext.Provider>
      </MenuContext.Provider>
    </Ariakit.MenuProvider>
  );

  return searchable ? (
    <Ariakit.ComboboxProvider value={value} includesBaseElement={false} setValue={onValueChange} resetValueOnHide>
      {content}
    </Ariakit.ComboboxProvider>
  ) : (
    content
  );
};

export type MenuTriggerProps = Ariakit.MenuButtonProps & {
  icon?: React.ReactNode;
  label?: React.ReactNode;
};

export const MenuTrigger = React.forwardRef<React.ElementRef<typeof Ariakit.MenuButton>, MenuTriggerProps>(
  ({ children, icon, label, ...props }, ref) => {
    return (
      <Ariakit.MenuButton ref={ref as any} render={(children as any) ?? <MenuItem />} {...props}>
        {icon}
        {label && <span>{label}</span>}
        <Ariakit.MenuButtonArrow className="ml-auto text-muted-foreground/80" />
      </Ariakit.MenuButton>
    );
  },
);

MenuTrigger.displayName = "MenuTrigger";

const menuVariants = cva(
  cn(
    "group/menu",
    "z-50 flex h-full min-w-[180px] max-w-[calc(100vw-24px)] flex-col p-0 text-popover-foreground",
    "data-[state=closed]:hidden",
  ),
  {
    defaultVariants: {
      animateZoom: false,
      variant: "default",
    },
    variants: {
      animateZoom: {
        false: "data-[state=open]:animate-popover",
        true: "data-[side=bottom]:origin-top data-[side=left]:origin-right data-[side=right]:origin-left data-[side=top]:origin-bottom data-[state=open]:animate-zoom",
      },
      variant: {
        ai: "w-full px-12 sm:px-[max(64px,calc(50%-350px))]",
        aiSub: "max-h-[70vh] w-[220px] rounded-xl bg-popover shadow-floating",
        default: "max-h-[70vh] w-[260px] overflow-y-auto rounded-xl bg-popover shadow-floating",
      },
    },
  },
);

export type MenuContentProps = Ariakit.MenuProps &
  VariantProps<typeof menuVariants> & {
    animateZoom?: boolean;
    onClickOutside?: (event: MouseEvent) => void;
  };

export const MenuContent = React.forwardRef<HTMLDivElement, MenuContentProps>(
  ({ animateZoom, children, className, variant, onClickOutside, ...props }, ref) => {
    const menuRef = React.useRef<HTMLDivElement | null>(null);
    const { open } = React.useContext(MenuContext);
    const side = useMenuSide();

    useOnClickOutside(menuRef, onClickOutside);

    return (
      <Ariakit.Menu
        ref={useComposedRef(ref, menuRef)}
        className={cn(menuVariants({ animateZoom, variant }), className)}
        data-side={side}
        data-state={open ? "open" : "closed"}
        gutter={4}
        flip
        unmountOnHide
        {...props}
      >
        {children}
      </Ariakit.Menu>
    );
  },
);

MenuContent.displayName = "MenuContent";

export type MenuSeparatorProps = Ariakit.MenuSeparatorProps;

export const MenuSeparator = React.forwardRef<HTMLHRElement, MenuSeparatorProps>(function MenuSeparator(props, ref) {
  return <Ariakit.MenuSeparator ref={ref} {...props} className={cn(props.className)} />;
});

export type MenuGroupProps = Ariakit.MenuGroupProps & {
  label?: React.ReactNode;
};

export const MenuGroup = React.forwardRef<HTMLDivElement, MenuGroupProps>(function MenuGroup({ label, ...props }, ref) {
  return (
    <>
      <MenuSeparator
        className={cn(
          "hidden",
          "peer-has-[[role=menuitem]]/menu-group:block peer-has-[[role=option]]/menu-group:block",
        )}
      />

      <Ariakit.MenuGroup
        ref={ref}
        {...props}
        className={cn(
          "hidden",
          "peer/menu-group group/menu-group my-1.5 has-[[role=menuitem]]:block has-[[role=option]]:block",
          props.className,
        )}
      >
        {label && (
          <Ariakit.MenuGroupLabel className="select-none px-[14px] pb-2 pt-1.5 text-xs font-medium text-muted-foreground">
            {label}
          </Ariakit.MenuGroupLabel>
        )}
        {props.children}
      </Ariakit.MenuGroup>
    </>
  );
});

export const MenuShortcut = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  function MenuShortcut(props, ref) {
    return <span ref={ref} {...props} className={cn("text-xs text-muted-foreground/80", props.className)} />;
  },
);

const menuItemVariants = cva(
  "group/menu-item relative flex min-h-[28px] select-none items-center justify-between gap-2 px-2.5 text-sm text-accent-foreground outline-none transition-bg-ease data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
  {
    defaultVariants: {
      isEmpty: false,
      variant: "default",
    },
    variants: {
      isEmpty: {
        false:
          "cursor-pointer hover:bg-accent focus:bg-accent focus:text-accent-foreground aria-[expanded=true]:bg-accent aria-[selected=true]:bg-accent",
        true: "text-muted-foreground",
      },
      variant: {
        default: "mx-1 w-[calc(100%-8px)] rounded-sm",
      },
    },
  },
);

export type MenuItemProps = Omit<Ariakit.ComboboxItemProps, "store"> & {
  checked?: boolean;
  group?: string;
  icon?: React.ReactNode;
  label?: string;
  name?: string;
  parentGroup?: string;
  preventClose?: boolean;
  shortcut?: React.ReactNode;
  shortcutEnter?: boolean;
  value?: string;
} & VariantProps<typeof menuItemVariants>;

export const MenuItem = React.forwardRef<HTMLDivElement, MenuItemProps>(function MenuItem(
  {
    checked,
    className,
    group,
    icon,
    isEmpty,
    label,
    name,
    parentGroup,
    preventClose,
    shortcut,
    shortcutEnter,
    variant,
    ...props
  },
  ref,
) {
  const menu = Ariakit.useMenuContext();

  if (!menu) throw new Error("MenuItem should be used inside a Menu");

  const searchable = React.useContext(SearchableContext);

  const hasShortcut = !!shortcut || shortcutEnter;

  const baseProps: MenuItemProps = {
    blurOnHoverEnd: false,
    focusOnHover: true,
    label,
    ...props,
    className: cn(menuItemVariants({ isEmpty, variant }), !!hasShortcut && "justify-between", className),
    group: parentGroup,
    name: group,
  };

  baseProps.children = (
    <>
      <div className="flex w-full items-center gap-2 whitespace-nowrap">
        {icon && <span className="menu-item-icon text-subtle-foreground w-4 h-4">{icon}</span>}
        {baseProps.children ?? label}
      </div>

      {(hasShortcut || checked) && (
        <div className="flex shrink-0 items-center justify-end">
          {checked && <Ariakit.MenuItemCheck checked={checked} />}
          {hasShortcut && (
            <MenuShortcut>
              {shortcut ?? <CornerDownLeft className="hidden group-data-[active-item='true']/menu-item:inline-block" />}
            </MenuShortcut>
          )}
          {checked && searchable && (
            <Ariakit.VisuallyHidden>{checked ? "checked" : "not checked"}</Ariakit.VisuallyHidden>
          )}
        </div>
      )}
    </>
  );

  if (!searchable) {
    if (name != null && props.value != null) {
      const radioProps = {
        ...baseProps,
        hideOnClick: true,
        name,
        value: props.value as any,
      };

      return <Ariakit.MenuItemRadio ref={ref} {...radioProps} />;
    }

    return <Ariakit.MenuItem ref={ref} {...baseProps} />;
  }

  const hideOnClick = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    const expandable = event.currentTarget.hasAttribute("aria-expanded");

    if (expandable) return false;
    if (preventClose) return false;

    menu.hideAll();

    return false;
  };

  return <Ariakit.ComboboxItem {...baseProps} ref={ref} hideOnClick={hideOnClick} />;
});

export const comboboxVariants = cva("", {
  defaultVariants: {
    variant: "default",
  },
  variants: {
    variant: {
      ai: "min-w-[280px] max-w-[calc(100vw-24px)] rounded-xl bg-popover py-0.5 shadow-toolbar",
      default: "mx-3 pb-1.5 pt-3.5",
    },
  },
});

export const ComboboxContent = withVariants(createPrimitiveElement("div"), comboboxVariants, ["variant"]);

const comboboxListVariants = cva(
  cn(
    "group/combobox-list",
    "h-full max-h-[70vh] grow overflow-y-auto rounded-lg [&:has(>:last-child:not([role=group]))]:pb-1.5",
    "hidden has-[[role=option]]:block",
  ),
  {
    defaultVariants: {
      variant: "default",
    },
    variants: {
      variant: {
        ai: "my-1 h-full max-h-[min(40vh,320px)] w-fit min-w-[280px] max-w-[320px] overflow-y-auto bg-popover p-0 shadow-floating",
        default: "",
      },
    },
  },
);

export const ComboboxList = withVariants(Ariakit.ComboboxList, comboboxListVariants, ["variant"]);

export const ComboboxInput = withRef<typeof Ariakit.Combobox>(({ children, ...props }, ref) => {
  return <Ariakit.Combobox ref={ref} render={children as any} autoSelect {...props} />;
});

export function ComboboxEmpty() {
  return (
    <div className="py-1.5 group-has-[[role=option]]/combobox-list:hidden">
      <div className={cn(menuItemVariants({ isEmpty: true }), "")} role="menuitem">
        No results
      </div>
    </div>
  );
}

export * as Ariakit from "@ariakit/react";

export function filterMenuItems({ items = [], ...group }: Action, searchValue: string): Action[] {
  if (!searchValue) return items;
  if ([group.label, ...(group.keywords || [])].join(" ").toLowerCase().includes(searchValue.toLowerCase())) {
    return items;
  }

  return items.filter(
    (item) =>
      item.filterItems ||
      [item.label, item.value, ...(item.keywords || [])].join(" ").toLowerCase().includes(searchValue.toLowerCase()),
  );
}

export function filterMenuGroups(menuGroups: Action[], searchValue: string): Action[] {
  if (!searchValue) return menuGroups;

  return menuGroups.reduce<Action[]>((acc, group) => {
    const filteredItems = filterMenuItems(group, searchValue);

    if (filteredItems.length > 0) {
      acc.push({
        ...group,
        items: filteredItems,
      });
    }

    return acc;
  }, []);
}

export function useComboboxValueState() {
  const store = Ariakit.useComboboxContext();
  const searchValue = store?.useState("value") ?? "";

  return [searchValue, store?.setValue] as const;
}

export function useMenuSide() {
  const store = Ariakit.useMenuStore();
  const currentPlacement = store?.useState("currentPlacement").split("-")[0];

  return currentPlacement;
}

export function useContextMenu(anchorRect: { x: number; y: number }) {
  const menu = Ariakit.useMenuStore();

  React.useEffect(() => {
    if (anchorRect) {
      menu.render();
    }
  }, [anchorRect, menu]);

  return {
    getAnchorRect: () => anchorRect,
    show: () => {
      menu.show();
      menu.setAutoFocusOnShow(true);
    },
    store: menu,
  };
}

export function useMenuStore() {
  const menu = Ariakit.useMenuStore();

  return {
    show: (anchorElement: HTMLElement) => {
      menu.setAnchorElement(anchorElement);
      menu.show();
      menu.setAutoFocusOnShow(true);
    },
    store: menu,
  };
}
