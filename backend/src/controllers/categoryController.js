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

module.exports = { listCategories, createCategory };
