const Warehouse = require('../models/Warehouse');

async function listWarehouses(req, res, next) {
  try {
    const warehouses = await Warehouse.find().sort({ name: 1 });
    res.json(warehouses);
  } catch (err) {
    next(err);
  }
}

async function createWarehouse(req, res, next) {
  try {
    const { name, location } = req.body;
    const warehouse = await Warehouse.create({ name, location });
    res.status(201).json(warehouse);
  } catch (err) {
    next(err);
  }
}

module.exports = { listWarehouses, createWarehouse };
