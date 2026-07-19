const Product = require('../models/Product');
const InventoryLog = require('../models/InventoryLog');

const FIELD_BY_TYPE = {
  stock: 'stock',
  damaged: 'damagedStock',
  reserved: 'reservedStock',
};

async function listInventory(req, res, next) {
  try {
    const { lowStockOnly, search } = req.query;
    const filter = {};
    if (lowStockOnly === 'true') filter.$expr = { $lte: ['$stock', '$lowStockThreshold'] };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ];
    }

    const products = await Product.find(filter)
      .select('name sku stock lowStockThreshold damagedStock reservedStock warehouse')
      .populate('warehouse', 'name')
      .sort({ name: 1 });

    res.json(products);
  } catch (err) {
    next(err);
  }
}

async function adjustInventory(req, res, next) {
  try {
    const { type, delta, reason } = req.body;
    const field = FIELD_BY_TYPE[type];
    if (!field) {
      return res.status(400).json({ message: `Invalid type. Must be one of: ${Object.keys(FIELD_BY_TYPE).join(', ')}` });
    }
    const quantityChange = Number(delta);
    if (!quantityChange) return res.status(400).json({ message: 'delta must be a non-zero number' });

    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const previousValue = product[field] || 0;
    const newValue = Math.max(0, previousValue + quantityChange);
    product[field] = newValue;
    await product.save();

    await InventoryLog.create({
      product: product._id,
      type,
      quantityChange,
      previousValue,
      newValue,
      reason,
    });

    res.json(product);
  } catch (err) {
    next(err);
  }
}

async function getHistory(req, res, next) {
  try {
    const logs = await InventoryLog.find({ product: req.params.productId }).sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    next(err);
  }
}

module.exports = { listInventory, adjustInventory, getHistory };
