"use client";

import { useEffect, useState } from "react";

import { useEditorRef, useElement, useReadOnly } from "@udecode/plate/react";
import { TIframeElement } from "../editor/plugins/iframe-plugin";

interface IframelyEmbed {
  html?: string;
}

export const useIframeState = () => {
  const element = useElement<TIframeElement>();
  const editor = useEditorRef();
  const readOnly = useReadOnly();
  const { align, url: initialUrl, html: elementHtml } = element;
  const [embed, setEmbed] = useState<IframelyEmbed | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!initialUrl) {
      setEmbed(undefined);
      return;
    }

    if (readOnly && elementHtml) {
      setEmbed({ html: elementHtml });
      return;
    }

    const fetchEmbedData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/iframe?url=${encodeURIComponent(initialUrl)}`, {
          next: {
            revalidate: 60 * 60 * 24 * 2, // 2 days
            tags: [`iframe-${initialUrl}`],
          },
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: response.statusText }));
          throw new Error(
            errorData.error || errorData.message || `Failed to fetch embed data from server: ${response.statusText}`,
          );
        }
        const data = await response.json();
        if (data.html) {
          setEmbed({ html: data.html });
          if (!readOnly) {
            const path = editor.api.findPath(element);
            editor.tf.setNodes<TIframeElement>({ html: data.html }, { at: path });
          }
        } else {
          console.warn("API endpoint did not return HTML for URL:", initialUrl, data);
          setError(data.error ? `Embed Error: ${data.error}` : "Could not retrieve embeddable content.");
          setEmbed(undefined);
        }
      } catch (e: any) {
        console.error("Error fetching from API endpoint:", e);
        setError(e.message || "Failed to fetch embed data.");
        setEmbed(undefined);
      }
      setIsLoading(false);
    };

    fetchEmbedData();
  }, [initialUrl, readOnly, elementHtml, editor, element]);

  return {
    align,
    embed,
    isLoading,
    error,
    unsafeUrl: initialUrl,
  };
};
