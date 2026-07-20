const Category = require('../models/Category');

function slugify(text) {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function listCategories(req, res, next) {
  try {
    const categories = await Category.find().populate('parent', 'name slug').sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    next(err);
  }
}

async function createCategory(req, res, next) {
  try {
    const { name, slug, parent, image, banner, seoTitle, metaDescription } = req.body;
    const category = await Category.create({
      name,
      slug: slug ? slugify(slug) : slugify(name),
      parent: parent || null,
      image,
      banner,
      seoTitle,
      metaDescription,
    });
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
}

async function updateCategory(req, res, next) {
  try {
    const { name, slug, parent, image, banner, seoTitle, metaDescription } = req.body;
    if (parent && parent === req.params.id) {
      return res.status(400).json({ message: 'A category cannot be its own parent' });
    }
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      {
        name,
        slug: slug ? slugify(slug) : slugify(name),
        parent: parent || null,
        image,
        banner,
        seoTitle,
        metaDescription,
      },
      { new: true, runValidators: true }
    );
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (err) {
    next(err);
  }
}

async function deleteCategory(req, res, next) {
  try {
    const hasChildren = await Category.exists({ parent: req.params.id });
    if (hasChildren) {
      return res.status(400).json({ message: 'Delete or reassign sub-categories before deleting this category' });
    }
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listCategories, createCategory, updateCategory, deleteCategory };
