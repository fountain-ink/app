import { createDraft } from "./create-draft";
import { getStaticEditor } from "@/components/editor/static";
import { Value, deserializeHtml } from "@udecode/plate";

type CreateDraftOptions = {
  initialContent?: any;
  documentId?: string;
  isGuest?: boolean;
  publishedId?: string;
  collaborative?: boolean;
};

/**
 * Creates a new draft from HTML content
 * @param htmlString The HTML string to convert to a draft
 * @param options Additional options to pass to createDraft
 * @returns Object containing the documentId of the created draft
 * @throws Error if the draft creation fails
 */
export async function createHtmlDraft(
  htmlString: string,
  title?: string,
  subtitle?: string,
  coverImageUrl?: string,
  options: Omit<CreateDraftOptions, "initialContent"> = {},
) {
  const editor = getStaticEditor();
  const nodes = deserializeHtml(editor, {
    element: htmlString,
  });
  if (title) {
    nodes.unshift({
      type: "title",
      children: [{ text: title }],
    });
  }
  if (subtitle) {
    nodes.unshift({
      type: "subtitle",
      children: [{ text: subtitle }],
    });
  }
  if (coverImageUrl) {
    nodes.unshift({
      type: "img",
      width: "wide",
      url: coverImageUrl,
      children: [{ text: "" }],
    });
  }

  return createDraft({
    ...options,
    initialContent: nodes as Value,
    collaborative: options.collaborative,
  });
}
