import { withRef } from "@udecode/cn";
import { PlateElement } from "@udecode/plate/react";

export const SubtitleElement = withRef<typeof PlateElement>(
  ({ children, ...props }, ref) => {
    return (
      <PlateElement
        ref={ref}
        as="header"
        className={"subtitle"}
        {...props}
      >
        {children}
      </PlateElement>
    );
  },
);
