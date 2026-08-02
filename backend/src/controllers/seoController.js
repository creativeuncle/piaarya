const Product = require('../models/Product');
const Category = require('../models/Category');
const Page = require('../models/Page');

function storefrontBaseUrl() {
  return process.env.CLIENT_URL || 'http://localhost:5174';
}

async function getSitemap(req, res, next) {
  try {
    const baseUrl = storefrontBaseUrl();
    const [products, categories, pages] = await Promise.all([
      Product.find().select('_id updatedAt'),
      Category.find().select('_id updatedAt'),
      Page.find({ isPublished: true }).select('slug updatedAt'),
    ]);

    const now = new Date().toISOString();
    const urls = [
      { loc: `${baseUrl}/`, lastmod: now },
      { loc: `${baseUrl}/products`, lastmod: now },
      ...products.map((p) => ({ loc: `${baseUrl}/products/${p._id}`, lastmod: p.updatedAt.toISOString() })),
      ...categories.map((c) => ({ loc: `${baseUrl}/products?category=${c._id}`, lastmod: c.updatedAt.toISOString() })),
      ...pages.map((pg) => ({ loc: `${baseUrl}/pages/${pg.slug}`, lastmod: pg.updatedAt.toISOString() })),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
      .map((u) => `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod></url>`)
      .join('\n')}\n</urlset>`;

    res.set('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    next(err);
  }
}

function getRobotsTxt(req, res) {
  const baseUrl = storefrontBaseUrl();
  res.set('Content-Type', 'text/plain');
  res.send(`User-agent: *\nAllow: /\nDisallow: /dashboard\nDisallow: /checkout\nSitemap: ${baseUrl}/sitemap.xml`);
}

module.exports = { getSitemap, getRobotsTxt };
