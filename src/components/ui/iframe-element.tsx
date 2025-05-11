'use client';

import React, { useEffect, useMemo, useState } from 'react';

import { cn, withRef } from '@udecode/cn';
import { ResizableProvider, useResizableValue } from '@udecode/plate-resizable';
import {
  PlateElement,
  useReadOnly,
  useFocused,
  useSelected,
  withHOC,
} from '@udecode/plate/react';

import { IframePlugin, TIframeElement } from '../editor/plugins/iframe-plugin';
import { useIframeState } from '../hooks/use-iframe-state';
import { Caption, CaptionTextarea } from './caption';
import { MediaPopover } from './media-popover';
import {
  mediaResizeHandleVariants,
  Resizable,
  ResizeHandle,
} from './resizable';
import { AlertCircleIcon, Loader2Icon } from 'lucide-react';
import { LoadingSpinner } from '../misc/loading-spinner';
import DOMPurify from 'dompurify';

export const IframeElement = withRef<typeof PlateElement>(({ children, className, ...props }, ref) => {
  const { embed, isLoading, error, unsafeUrl } = useIframeState();
  const [sanitizedHtml, setSanitizedHtml] = useState('');
  const readOnly = useReadOnly()
  const selected = useSelected()

  useEffect(() => {
    setSanitizedHtml(DOMPurify.sanitize(embed?.html || '', {
      ADD_TAGS: ['iframe'],
      ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling'],
      FORBID_TAGS: ['script']
    }));
  }, [embed?.html]);

  useEffect(() => {
    console.log("iframely" in window)
    if ((window as any).iframely) {
      (window as any).iframely.load();
    }
  }, [sanitizedHtml]);

  const divWithIframe = useMemo(() => {
    return <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
  }, [sanitizedHtml])

  return (

    <MediaPopover plugin={IframePlugin}>
      <PlateElement
        ref={ref}
        className={cn(className, 'my-9 rounded-md overflow-hidden',
          error && 'border-2 border-destructive ',
        )}

        {...props}
      >
        <figure
          className="group relative m-0 w-full h-auto flex-1"
          contentEditable={false}
        >
          {isLoading && (
            <div className="flex flex-col text-muted-foreground aspect-video gap-2 p-4 items-center justify-center">
              <LoadingSpinner />
              <div className="placeholder-background" />
            </div>
          )}

          {error && (
            <div className="flex flex-col aspect-video bg-destructive/10 gap-2 p-4 items-center justify-center">
              <AlertCircleIcon className="w-8 h-8 text-destructive" />
              <span className="text-sm p-4 line-clamp-3 inline-block text-center rounded-md">{error}</span>
              <span className="text-xs p-2 border border-dashed border-destructive bg-destructive/30 rounded-md text-muted-foreground">{unsafeUrl}</span>
              <div className="placeholder-background" />
            </div>
          )}

          {!error && !isLoading && !embed?.html && (
            <div className="flex flex-col aspect-video gap-2 p-4 items-center justify-center">
              <AlertCircleIcon className="w-8 h-8 text-muted-foreground" />
              <span className="text-sm p-4 line-clamp-3 inline-block text-center rounded-md">No embeddable content found for this URL.</span>
              <div className="placeholder-background" />
            </div>
          )}

          <div className={cn(
            "w-full h-full relative not-prose not-article m-0",
            selected && 'ring ring-2 ring-primary'
          )}
          >
            {divWithIframe}
          </div>

        </figure>

        <Caption>
          <CaptionTextarea
            placeholder="Write a caption..."
            readOnly={readOnly}
          />
        </Caption>

        {children}
      </PlateElement>
    </MediaPopover>
  );
})
