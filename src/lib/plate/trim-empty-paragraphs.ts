export const trimEmptyTrailingParagraphs = (nodes: any[] | undefined): any[] | undefined => {
  if (!Array.isArray(nodes)) {
    return nodes;
  }

  const mutableNodes = [...nodes];
  while (mutableNodes.length > 0) {
    const lastNode = mutableNodes[mutableNodes.length - 1];
    if (
      lastNode &&
      lastNode.type === 'p' &&
      Array.isArray(lastNode.children) &&
      lastNode.children.length === 1 &&
      lastNode.children[0] &&
      typeof lastNode.children[0].text === 'string' &&
      lastNode.children[0].text === ''
    ) {
      mutableNodes.pop();
    } else {
      break;
    }
  }
  return mutableNodes;
}; 