const Product = require('../models/Product');

function slugify(text) {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function parseList(value) {
  if (!value) return null;
  const list = value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
  return list.length ? list : null;
}

const SORT_OPTIONS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  relevance: { createdAt: -1 },
};

async function listProducts(req, res, next) {
  try {
    const {
      search,
      category,
      tag,
      color,
      size,
      style,
      material,
      occasion,
      priceMin,
      priceMax,
      sort,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};
    const categories = parseList(category);
    if (categories) filter.category = categories.length > 1 ? { $in: categories } : categories[0];
    if (tag) filter.tags = tag;

    const colors = parseList(color);
    if (colors) filter['variants.color'] = { $in: colors };
    const sizes = parseList(size);
    if (sizes) filter['variants.size'] = { $in: sizes };

    const styles = parseList(style);
    if (styles) filter.style = { $in: styles };
    const materials = parseList(material);
    if (materials) filter.material = { $in: materials };
    const occasions = parseList(occasion);
    if (occasions) filter.occasion = { $in: occasions };

    if (priceMin || priceMax) {
      filter.price = {};
      if (priceMin) filter.price.$gte = Number(priceMin);
      if (priceMax) filter.price.$lte = Number(priceMax);
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOption = SORT_OPTIONS[sort] || SORT_OPTIONS.relevance;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name')
        .populate('subCategory', 'name')
        .sort(sortOption)
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit)),
      Product.countDocuments(filter),
    ]);

    res.json({ products, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
}

async function getFacets(req, res, next) {
  try {
    const [sizes, colors, styles, materials, occasions, priceStats] = await Promise.all([
      Product.distinct('variants.size'),
      Product.distinct('variants.color'),
      Product.distinct('style'),
      Product.distinct('material'),
      Product.distinct('occasion'),
      Product.aggregate([{ $group: { _id: null, min: { $min: '$price' }, max: { $max: '$price' } } }]),
    ]);

    res.json({
      sizes: sizes.filter(Boolean).sort(),
      colors: colors.filter(Boolean).sort(),
      styles: styles.filter(Boolean).sort(),
      materials: materials.filter(Boolean).sort(),
      occasions: occasions.filter(Boolean).sort(),
      priceMin: priceStats[0]?.min || 0,
      priceMax: priceStats[0]?.max || 0,
    });
  } catch (err) {
    next(err);
  }
}

async function getProduct(req, res, next) {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name')
      .populate('subCategory', 'name');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
}

function buildProductPayload(body) {
  const payload = { ...body };
  if (!payload.slug && payload.name) payload.slug = slugify(payload.name);
  else if (payload.slug) payload.slug = slugify(payload.slug);
  if (!payload.category) delete payload.category;
  if (!payload.subCategory) delete payload.subCategory;
  return payload;
}

async function createProduct(req, res, next) {
  try {
    const product = await Product.create(buildProductPayload(req.body));
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
}

async function updateProduct(req, res, next) {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, buildProductPayload(req.body), {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listProducts, getFacets, getProduct, createProduct, updateProduct, deleteProduct };
