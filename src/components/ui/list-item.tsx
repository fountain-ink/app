import { cn, withRef } from "@udecode/cn";
import { PlateElement } from "@udecode/plate/react";

export const ListItemElement = withRef<typeof PlateElement>(({ children, className, ...props }, ref) => {
  return (
    <PlateElement as="li" ref={ref} className={cn(className, "")} {...props}>
      {children}
    </PlateElement>
  );
});
