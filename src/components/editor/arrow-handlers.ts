import type { Editor } from "@tiptap/core";

const handleImageSelection = (editor: Editor, pos: number) => {
  editor.commands.setNodeSelection(pos);
  editor.commands.focus();
  editor.emit('imageSelected');
  return true;
};
const handleArrowDown = (editor: Editor) => {
  const { selection } = editor.state;
  const { $anchor } = selection;

  const currentNode = $anchor.parent;

  if (["title", "subtitle"].includes(currentNode.type.name)) {
    const pos = $anchor.after();
    const nextNode = editor.state.doc.nodeAt(pos);

    if (nextNode && nextNode.type.name === "paragraph") {
      editor.commands.setTextSelection(pos + 1);
      return true;
    }
  }

  // Allow default behavior for text-based nodes
  if (["paragraph", "title", "subtitle"].includes(currentNode.type.name)) {
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

  // Allow default behavior for text-based nodes
  if (["paragraph", "title", "subtitle"].includes(currentNode.type.name)) {
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
