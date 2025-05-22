import { withRef } from "@udecode/cn";
import { PlateElement } from "@udecode/plate/react";

export const TitleElement = withRef<typeof PlateElement>(({ children, ...props }, ref) => {
  return (
    <PlateElement ref={ref} as="header" className={"title"} {...props}>
      {children}
    </PlateElement>
  );
});
