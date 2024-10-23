import type { Editor } from "@tiptap/core";

const handleArrowDown = (editor: Editor) => {
  const { selection } = editor.state;
  const { $anchor } = selection;
  const currentNode = $anchor.parent;

  if (["title", "subtitle", "paragraph", "quoteCaption", "heading"].includes(currentNode.type.name)) {
    const pos = $anchor.after();
    const nextNode = editor.state.doc.nodeAt(pos);

    if (nextNode && nextNode.type.name === "paragraph") {
      editor.commands.setTextSelection(pos + 1);
      return true;
    }
  }

  // Allow default behavior for text-based nodes
  if (["paragraph", "title", "subtitle", "quoteCaption", "heading"].includes(currentNode.type.name)) {
    return false;
  }

  const pos = selection.empty ? $anchor.pos : selection.to;
  const nextNode = $anchor.doc.nodeAt(pos);

  if (currentNode.type.name === "image") {
    // If we're on an image, move to the next node
    const after = $anchor.after();
    if (after < $anchor.doc.content.size) {
      editor.commands.setTextSelection(after + 1);
      return true;
    }
  } else if (nextNode) {
    if (nextNode.type.name === "image") {
      // For images, select the image node
      editor.commands.setNodeSelection(pos);
    } else {
      // For other nodes, move to their start
      editor.commands.setTextSelection(pos + 1);
    }
    return true;
  }

  // If we're at the end of the document, ensure the cursor stays visible
  if (pos >= $anchor.doc.content.size) {
    editor.commands.scrollIntoView();
  }

  return false;
};
const handleArrowUp = (editor: Editor) => {
  const { selection } = editor.state;
  const { $anchor } = selection;
  const currentNode = $anchor.parent;

  // Check if we're at the start of the document
  if ($anchor.pos === 0) {
    return true; // Prevent default behavior
  }

  if (["title", "subtitle", "paragraph", "quoteCaption", "heading"].includes(currentNode.type.name)) {
    const pos = $anchor.before();
    // Ensure pos is not negative
    if (pos > 0) {
      const prevNode = editor.state.doc.nodeAt(pos - 1);

      if (prevNode && prevNode.type.name === "paragraph") {
        editor.commands.setTextSelection(pos - 1);
        return true;
      }
    }
  }

  // Allow default behavior for text-based nodes
  if (["paragraph", "title", "subtitle", "quoteCaption", "heading"].includes(currentNode.type.name)) {
    return false;
  }

  const pos = selection.empty ? $anchor.pos : selection.from;
  const prevNode = $anchor.doc.nodeAt(pos - 1);

  if (currentNode.type.name === "image") {
    // If we're on an image, move to the previous node
    const before = $anchor.before();
    if (before > 0) {
      editor.commands.setTextSelection(before - 1);
      return true;
    }
  } else if (prevNode) {
    if (prevNode.type.name === "image") {
      // For images, select the image node
      editor.commands.setNodeSelection(pos - 1);
    } else {
      // For other nodes, move to their end
      editor.commands.setTextSelection(pos - 1);
    }
    return true;
  }

  // If we're at the start of the document, ensure the cursor stays visible
  if (pos <= 1) {
    editor.commands.scrollIntoView();
  }

  return false;
};

export const arrowHandlers = {
  handleArrowDown,
  handleArrowUp,
};
