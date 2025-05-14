import { ParagraphPlugin } from "@udecode/plate-core/react";

export const trimEmptyNodes = (nodes: any[] | undefined): any[] | undefined => {
  if (!Array.isArray(nodes)) {
    return nodes;
  }

  const nodesWithoutPlaceholders = nodes.filter(node => {
    return (node
      && (node.type === 'subtitle' || node.type === 'title')
      && node.children[0]
      && node.children[0].text.trim() === ''
    ) ? false : true;
  });

  const nodesWithoutImagePlaceholders = nodesWithoutPlaceholders.filter(node => {
    if (node.type === 'img' && !node.url) {
      return false;
    }
    return true;
  });

  const mutableNodes = [...nodesWithoutImagePlaceholders];
  while (mutableNodes.length > 0) {
    const lastNode = mutableNodes[mutableNodes.length - 1];
    if (
      lastNode &&
      lastNode.type &&
      lastNode.type === ParagraphPlugin.key &&
      Array.isArray(lastNode.children) &&
      lastNode.children.length === 1 &&
      lastNode.children[0] &&
      typeof lastNode.children[0].text === 'string' &&
      lastNode.children[0].text.trim() === ''
    ) {
      mutableNodes.pop();
    } else {
      break;
    }
  }
  return mutableNodes;
}; 