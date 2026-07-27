const Customer = require('../models/Customer');
const Order = require('../models/Order');
const ReturnRequest = require('../models/ReturnRequest');
const { triggerNotification } = require('../services/notificationService');

const CANCEL_WINDOW_MS = 10 * 60 * 1000;

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

async function updateAddress(req, res, next) {
  try {
    const { label, line1, line2, city, state, pincode, country, isDefault } = req.body;
    const customer = await Customer.findById(req.customerId);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    const address = customer.addresses[Number(req.params.index)];
    if (!address) return res.status(404).json({ message: 'Address not found' });

    if (isDefault) customer.addresses.forEach((a) => (a.isDefault = false));
    address.label = label;
    address.line1 = line1;
    address.line2 = line2;
    address.city = city;
    address.state = state;
    address.pincode = pincode;
    address.country = country;
    address.isDefault = Boolean(isDefault);
    await customer.save();

    res.json(customer.addresses);
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

async function getOrderById(req, res, next) {
  try {
    const order = await Order.findOne({ _id: req.params.id, customer: req.customerId }).populate(
      'items.product',
      'name media'
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const cancellable =
      order.status !== 'cancelled' && Date.now() - new Date(order.createdAt).getTime() <= CANCEL_WINDOW_MS;

    res.json({ ...order.toObject(), cancellable });
  } catch (err) {
    next(err);
  }
}

async function cancelOrder(req, res, next) {
  try {
    const order = await Order.findOne({ _id: req.params.id, customer: req.customerId });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.status === 'cancelled') {
      return res.status(400).json({ message: 'Order is already cancelled' });
    }

    if (Date.now() - new Date(order.createdAt).getTime() > CANCEL_WINDOW_MS) {
      return res.status(400).json({ message: 'Cancellation window has expired' });
    }

    order.status = 'cancelled';
    await order.save();

    const customer = await Customer.findById(req.customerId);
    triggerNotification('order_cancelled', {
      customer,
      order,
      vars: { customerName: customer?.name, orderNumber: order.orderNumber, amount: order.totalAmount },
    });

    res.json(order);
  } catch (err) {
    next(err);
  }
}

async function getRequests(req, res, next) {
  try {
    const orderIds = await Order.find({ customer: req.customerId }).distinct('_id');
    const requests = await ReturnRequest.find({ order: { $in: orderIds } })
      .populate('order', 'orderNumber')
      .populate('items.product', 'name media')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProfile,
  updateProfile,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  getOrders,
  getOrderById,
  cancelOrder,
  getRequests,
};
