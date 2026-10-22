const PageLayout = require('../models/PageLayout');

// Matches the current hardcoded order of storefront-next's Home page —
// what a store sees before it has ever saved a custom layout.
const DEFAULT_SECTIONS = {
  home: [
    { key: 'hero_slider', type: 'hero_slider', visible: true, settings: {} },
    { key: 'explore_products', type: 'explore_products', visible: true, settings: {} },
    { key: 'categories_slider', type: 'categories_slider', visible: true, settings: {} },
    { key: 'trending_products', type: 'trending_products', visible: true, settings: {} },
    { key: 'video_section', type: 'video_section', visible: true, settings: {} },
    { key: 'reviews', type: 'reviews', visible: true, settings: {} },
    { key: 'feature_bar', type: 'feature_bar', visible: true, settings: {} },
  ],
};

async function getLayout(req, res, next) {
  try {
    const page = req.params.page;
    if (!PageLayout.PAGES.includes(page)) {
      return res.status(404).json({ message: 'Unknown page' });
    }

    const layout = await PageLayout.findOne({ page });
    res.json({ page, sections: layout ? layout.sections : DEFAULT_SECTIONS[page] });
  } catch (err) {
    next(err);
  }
}

async function saveLayout(req, res, next) {
  try {
    const page = req.params.page;
    if (!PageLayout.PAGES.includes(page)) {
      return res.status(404).json({ message: 'Unknown page' });
    }

    const sections = Array.isArray(req.body.sections) ? req.body.sections : null;
    if (!sections) {
      return res.status(400).json({ message: 'sections must be an array' });
    }
    for (const section of sections) {
      if (!PageLayout.SECTION_TYPES.includes(section.type)) {
        return res.status(400).json({ message: `Unknown section type: ${section.type}` });
      }
    }

    const layout = await PageLayout.findOneAndUpdate(
      { page },
      { page, sections },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({ page, sections: layout.sections });
  } catch (err) {
    next(err);
  }
}

module.exports = { getLayout, saveLayout };
