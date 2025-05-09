export const trimEmptyNodes = (nodes: any[] | undefined): any[] | undefined => {
  if (!Array.isArray(nodes)) {
    return nodes;
  }

  const nodesWithoutEmptySubtitles = nodes.filter(node => {
    if (
      node &&
      (node.type === 'subtitle' || node.type === 'title') &&
      Array.isArray(node.children) &&
      node.children.length === 1 &&
      node.children[0] &&
      typeof node.children[0].text === 'string' &&
      node.children[0].text.trim() === ''
    ) {
      return false;
    }
    return true;
  });

  const mutableNodes = [...nodesWithoutEmptySubtitles];
  while (mutableNodes.length > 0) {
    const lastNode = mutableNodes[mutableNodes.length - 1];
    if (
      lastNode &&
      lastNode.type &&
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