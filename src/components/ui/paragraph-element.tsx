'use client';

import React from 'react';

import { cn } from '@udecode/cn';
import { PlateElement } from '@udecode/plate/react';

export function ParagraphElement({
  children,
  className,
  ...props
}: React.ComponentProps<typeof PlateElement>) {
  return (
    <PlateElement
      className={cn(className)}
      as="p"
      {...props}
      style={{
        ...props.style,
        backgroundColor: props.element.backgroundColor as any,
      }}
    >
      {children}
    </PlateElement>
  );
}
