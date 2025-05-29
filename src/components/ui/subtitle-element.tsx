import { withRef } from "@udecode/cn";
import { PlateElement, useEditorRef } from "@udecode/plate/react";

export const SubtitleElement = withRef<typeof PlateElement>(({ children, attributes, ...props }, ref) => {
  const editor = useEditorRef();

  return (
    <PlateElement
      ref={ref}
      as="header"
      className={"subtitle"}
      attributes={{
        ...attributes,
        onClick: (e: React.MouseEvent) => {
          const isEmpty = editor.api.isEmpty(props.element);
          if (isEmpty) {
            e.stopPropagation();
            const path = editor.api.findPath(props.element);
            if (path) {
              editor.tf.select(path);
              editor.tf.focus();
              editor.tf.collapse({ edge: 'start' });
            }
          }
        },
        onMouseDown: (e: React.MouseEvent) => {
          const isEmpty = editor.api.isEmpty(props.element);
          if (isEmpty) {
            e.stopPropagation();
          }
        },
      }}
      {...props}
    >
      {children}
    </PlateElement>
  );
});
