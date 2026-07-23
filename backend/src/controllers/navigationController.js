const NavigationItem = require('../models/NavigationItem');

async function getNavigation(req, res, next) {
  try {
    const items = await NavigationItem.find().sort({ order: 1 });
    const byParent = new Map();
    items.forEach((item) => {
      const key = item.parent ? String(item.parent) : 'root';
      if (!byParent.has(key)) byParent.set(key, []);
      byParent.get(key).push(item);
    });

    const tree = (byParent.get('root') || []).map((item) => ({
      _id: item._id,
      label: item.label,
      route: item.route,
      children: (byParent.get(String(item._id)) || []).map((child) => ({
        _id: child._id,
        label: child.label,
        route: child.route,
      })),
    }));

    res.json(tree);
  } catch (err) {
    next(err);
  }
}

async function replaceNavigation(req, res, next) {
  try {
    const menus = req.body.menus || [];
    await NavigationItem.deleteMany({});

    for (let i = 0; i < menus.length; i++) {
      const menu = menus[i];
      const parentDoc = await NavigationItem.create({
        label: menu.label,
        route: menu.route,
        parent: null,
        order: i,
      });
      const children = menu.children || [];
      for (let j = 0; j < children.length; j++) {
        await NavigationItem.create({
          label: children[j].label,
          route: children[j].route,
          parent: parentDoc._id,
          order: j,
        });
      }
    }

    const items = await NavigationItem.find().sort({ order: 1 });
    res.json({ message: 'Navigation saved', count: items.length });
  } catch (err) {
    next(err);
  }
}

module.exports = { getNavigation, replaceNavigation };
