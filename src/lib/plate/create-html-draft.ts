import { createDraft } from './create-draft';
import { getStaticEditor } from '@/components/editor/static';
import { Value, deserializeHtml } from '@udecode/plate';

type CreateDraftOptions = {
  initialContent?: any;
  documentId?: string;
  isGuest?: boolean;
  publishedId?: string;
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
  options: Omit<CreateDraftOptions, 'initialContent'> = {}
) {
  const editor = getStaticEditor();
  const nodes = deserializeHtml(editor, {
    element: htmlString,
  });
  console.log(nodes);

  return createDraft({
    ...options,
    initialContent: nodes as Value,
  });
} 