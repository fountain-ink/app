import React from 'react';

import type { VariantProps } from 'class-variance-authority';

import { cn } from '@udecode/cn';
import { type PlateStaticProps, PlateStatic } from '@udecode/plate';
import { cva } from 'class-variance-authority';

export const editorVariants = cva(
  cn(
    'group/editor',
    'relative w-full overflow-x-hidden whitespace-pre-wrap break-words',
    'rounded-md ring-offset-background placeholder:text-muted-foreground/80 focus-visible:outline-hidden',
    '**:data-slate-placeholder:text-muted-foreground/80 **:data-slate-placeholder:opacity-100!',
    '**:data-slate-placeholder:top-[auto_!important]',
    '[&_strong]:font-bold'
  ),
  {
    defaultVariants: {
      variant: 'default',
    },
    variants: {
      disabled: {
        true: 'cursor-not-allowed opacity-50',
      },
      focused: {
        true: 'ring-2 ring-ring ring-offset-2',
      },
      variant: {
        ai: 'px-0 text-base md:text-sm',
        aiChat:
          'max-h-[min(70vh,320px)] max-w-[700px] overflow-y-auto px-3 py-2 text-base md:text-sm',
        comment: cn('rounded-none border-none bg-transparent text-sm'),
        default:
          'min-h-full px-16 pb-72 text-base sm:px-[max(64px,calc(50%-350px))]',
        demo: 'h-full px-16 pb-72 pt-4 text-base sm:px-[max(64px,calc(50%-350px))]',
        fullWidth: 'min-h-full px-16 pb-72 text-base sm:px-24',
        select: 'px-3 py-2 text-base data-readonly:w-fit',
        update: 'px-0 text-sm',
        versionHistory: 'px-0 pb-[30vh] text-base',
      },
    },
  }
);

export function EditorStatic({
  children,
  className,
  variant,
  ...props
}: PlateStaticProps & VariantProps<typeof editorVariants>) {
  return (
    <PlateStatic
      className={cn(editorVariants({ variant }), className)}
      {...props}
    />
  );
}
