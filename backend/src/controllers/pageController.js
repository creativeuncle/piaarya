const Page = require('../models/Page');

function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function uniqueSlug(base, excludeId) {
  let slug = base || 'page';
  let counter = 2;
  while (true) {
    const filter = { slug };
    if (excludeId) filter._id = { $ne: excludeId };
    const existing = await Page.findOne(filter);
    if (!existing) return slug;
    slug = `${base}-${counter}`;
    counter += 1;
  }
}

async function listPages(req, res, next) {
  try {
    const { search } = req.query;
    const filter = {};
    if (search) filter.title = { $regex: search, $options: 'i' };
    const pages = await Page.find(filter).sort({ createdAt: -1 });
    res.json(pages);
  } catch (err) {
    next(err);
  }
}

async function getPage(req, res, next) {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) return res.status(404).json({ message: 'Page not found' });
    res.json(page);
  } catch (err) {
    next(err);
  }
}

async function createPage(req, res, next) {
  try {
    const { title, slug, content, seoTitle, metaDescription, isPublished } = req.body;
    const baseSlug = slugify(slug || title);
    const finalSlug = await uniqueSlug(baseSlug);
    const page = await Page.create({
      title,
      slug: finalSlug,
      content,
      seoTitle,
      metaDescription,
      isPublished,
    });
    res.status(201).json(page);
  } catch (err) {
    next(err);
  }
}

async function updatePage(req, res, next) {
  try {
    const { title, slug, content, seoTitle, metaDescription, isPublished } = req.body;
    const baseSlug = slugify(slug || title);
    const finalSlug = await uniqueSlug(baseSlug, req.params.id);
    const page = await Page.findByIdAndUpdate(
      req.params.id,
      { title, slug: finalSlug, content, seoTitle, metaDescription, isPublished },
      { new: true, runValidators: true }
    );
    if (!page) return res.status(404).json({ message: 'Page not found' });
    res.json(page);
  } catch (err) {
    next(err);
  }
}

async function deletePage(req, res, next) {
  try {
    const page = await Page.findByIdAndDelete(req.params.id);
    if (!page) return res.status(404).json({ message: 'Page not found' });
    res.json({ message: 'Page deleted' });
  } catch (err) {
    next(err);
  }
}

async function getPageBySlug(req, res, next) {
  try {
    const page = await Page.findOne({ slug: req.params.slug, isPublished: true });
    if (!page) return res.status(404).json({ message: 'Page not found' });
    res.json(page);
  } catch (err) {
    next(err);
  }
}

module.exports = { listPages, getPage, createPage, updatePage, deletePage, getPageBySlug, slugify };
