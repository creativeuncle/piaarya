const Customer = require('../models/Customer');
const Order = require('../models/Order');
const ReturnRequest = require('../models/ReturnRequest');

function toPublicCustomer(customer) {
  return {
    id: customer._id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
  };
}

async function getProfile(req, res, next) {
  try {
    const customer = await Customer.findById(req.customerId);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(toPublicCustomer(customer));
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const { name, phone } = req.body;
    const customer = await Customer.findByIdAndUpdate(req.customerId, { name, phone }, { new: true, runValidators: true });
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(toPublicCustomer(customer));
  } catch (err) {
    next(err);
  }
}

async function getAddresses(req, res, next) {
  try {
    const customer = await Customer.findById(req.customerId);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(customer.addresses);
  } catch (err) {
    next(err);
  }
}

async function addAddress(req, res, next) {
  try {
    const { label, line1, line2, city, state, pincode, country, isDefault } = req.body;
    const customer = await Customer.findById(req.customerId);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    if (isDefault) customer.addresses.forEach((a) => (a.isDefault = false));
    customer.addresses.push({ label, line1, line2, city, state, pincode, country, isDefault: Boolean(isDefault) });
    await customer.save();

    res.status(201).json(customer.addresses);
  } catch (err) {
    next(err);
  }
}

async function deleteAddress(req, res, next) {
  try {
    const customer = await Customer.findById(req.customerId);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    customer.addresses.splice(Number(req.params.index), 1);
    await customer.save();

    res.json(customer.addresses);
  } catch (err) {
    next(err);
  }
}

async function getOrders(req, res, next) {
  try {
    const orders = await Order.find({ customer: req.customerId })
      .populate('items.product', 'name media')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    next(err);
  }
}

async function getRequests(req, res, next) {
  try {
    const orderIds = await Order.find({ customer: req.customerId }).distinct('_id');
    const requests = await ReturnRequest.find({ order: { $in: orderIds } })
      .populate('order', 'orderNumber')
      .populate('items.product', 'name')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    next(err);
  }
}

module.exports = { getProfile, updateProfile, getAddresses, addAddress, deleteAddress, getOrders, getRequests };
