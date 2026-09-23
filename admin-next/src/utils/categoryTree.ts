export const LEVEL_LABELS = ['Main Category', 'Sub Category', 'Child Category'];
export const MAX_DEPTH = 2; // 0 = Main, 1 = Sub, 2 = Child

export function depthOf(category, categoriesById) {
  let depth = 0;
  let current = category;
  while (current?.parent) {
    const parentId = current.parent._id || current.parent;
    current = categoriesById.get(parentId);
    if (!current) break;
    depth += 1;
  }
  return depth;
}

export function buildTree(categories) {
  const byId = new Map(categories.map((c) => [c._id, c]));
  const childrenOf = new Map();
  categories.forEach((c) => {
    const parentId = c.parent?._id || c.parent || null;
    if (!childrenOf.has(parentId)) childrenOf.set(parentId, []);
    childrenOf.get(parentId).push(c);
  });

  function attach(parentId, depth) {
    const nodes = (childrenOf.get(parentId) || []).sort((a, b) => a.name.localeCompare(b.name));
    return nodes.map((node) => ({ ...node, depth, children: attach(node._id, depth + 1) }));
  }

  return { tree: attach(null, 0), byId };
}

export function flattenTree(tree) {
  const rows = [];
  function walk(nodes) {
    nodes.forEach((node) => {
      rows.push(node);
      walk(node.children);
    });
  }
  walk(tree);
  return rows;
}
