import { withRef, withVariants } from "@udecode/cn";
import { cva } from "class-variance-authority";
import { PlateElement } from "./plate-element";

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
  ({ children, element, variant = "title", ...props }, ref) => {
    return (
      <TitleElementVariants
        id={element?.id as string}
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