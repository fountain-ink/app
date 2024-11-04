'use client';

import React from 'react';

import { withRef, withVariants } from '@udecode/cn';
import { cva } from 'class-variance-authority';

import { PlateElement } from './plate-element';

const listVariants = cva('m-0 ps-6', {
  variants: {
    variant: {
      ol: 'list-decimal prose-p:my-0 prose-p:m-0',
      ul: 'list-disc [&_ul]:list-[circle] [&_ul_ul]:list-[square] prose-p:my-0 prose-p:m-0',
    },
  },
});

const ListElementVariants = withVariants(PlateElement, listVariants, [
  'variant',
]);

export const ListElement = withRef<typeof ListElementVariants>(
  ({ children, variant = 'ul', ...props }, ref) => {
    return (
      <ListElementVariants ref={ref} as={variant!} variant={variant} {...props}>
        {children}
      </ListElementVariants>
    );
  }
);
