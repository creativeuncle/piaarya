const NavigationItem = require('../models/NavigationItem');

function buildTree(items, parentId = null) {
  return items
    .filter((item) => String(item.parent || '') === String(parentId || ''))
    .map((item) => ({
      _id: item._id,
      label: item.label,
      route: item.route,
      children: buildTree(items, item._id),
    }));
}

async function getNavigation(req, res, next) {
  try {
    const items = await NavigationItem.find().sort({ order: 1 });
    const tree = buildTree(items, null);
    res.json(tree);
  } catch (err) {
    next(err);
  }
}

async function saveTree(menus, parentId) {
  for (let i = 0; i < menus.length; i++) {
    const menu = menus[i];
    const doc = await NavigationItem.create({
      label: menu.label,
      route: menu.route || '',
      parent: parentId,
      order: i,
    });
    if (menu.children?.length) {
      await saveTree(menu.children, doc._id);
    }
  }
}

async function replaceNavigation(req, res, next) {
  try {
    const menus = req.body.menus || [];
    await NavigationItem.deleteMany({});
    await saveTree(menus, null);

    const items = await NavigationItem.find().sort({ order: 1 });
    res.json({ message: 'Navigation saved', count: items.length });
  } catch (err) {
    next(err);
  }
}

module.exports = { getNavigation, replaceNavigation };
