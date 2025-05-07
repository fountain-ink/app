import { withRef, withVariants } from "@udecode/cn";
import { cva } from "class-variance-authority";
import { PlateElement } from "@udecode/plate/react";

const titleVariants = cva("relative", {
  variants: {
    variant: {
      title: "title",
      subtitle: "subtitle",
    },
  },
});

const TitleElementVariants = withVariants(PlateElement, titleVariants, ["variant"]);

export const TitleElement = withRef<typeof TitleElementVariants>(
  ({ children, element, variant = "title", attributes, ...props }, ref) => {
    return (
      <TitleElementVariants
        attributes={{
          id: element?.id as string,
          ...attributes,
        }}
        ref={ref}
        variant={variant}
        element={element}
        as="header"
        {...props}
      >
        {children}
      </TitleElementVariants>
    );
  },
);
