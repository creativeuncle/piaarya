const bcrypt = require('bcryptjs');
const Customer = require('../models/Customer');
const { signToken } = require('../middleware/auth');

function toPublicCustomer(customer) {
  return {
    id: customer._id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
  };
}

async function signup(req, res, next) {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existing = await Customer.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const customer = await Customer.create({ name, email, phone, passwordHash });

    res.status(201).json({ token: signToken(customer._id), customer: toPublicCustomer(customer) });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const customer = await Customer.findOne({ email: (email || '').toLowerCase().trim() });
    if (!customer) return res.status(401).json({ message: 'Invalid email or password' });
    if (customer.isBlocked) return res.status(403).json({ message: 'This account has been blocked' });

    const matches = await bcrypt.compare(password || '', customer.passwordHash);
    if (!matches) return res.status(401).json({ message: 'Invalid email or password' });

    res.json({ token: signToken(customer._id), customer: toPublicCustomer(customer) });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const customer = await Customer.findById(req.customerId);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json({ customer: toPublicCustomer(customer) });
  } catch (err) {
    next(err);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    await Customer.findOne({ email: (email || '').toLowerCase().trim() });
    res.json({ message: 'If an account exists for that email, password reset instructions have been sent.' });
  } catch (err) {
    next(err);
  }
}

async function requestOtp(req, res, next) {
  try {
    const { email } = req.body;
    const customer = await Customer.findOne({ email: (email || '').toLowerCase().trim() });
    if (!customer) return res.status(404).json({ message: 'No account found for this email' });

    const otpCode = String(Math.floor(100000 + Math.random() * 900000));
    customer.otpCode = otpCode;
    customer.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await customer.save();

    res.json({
      message: 'OTP generated. No SMS/email provider is connected yet, so it is returned here for testing.',
      otp: otpCode,
    });
  } catch (err) {
    next(err);
  }
}

async function verifyOtp(req, res, next) {
  try {
    const { email, otp } = req.body;
    const customer = await Customer.findOne({ email: (email || '').toLowerCase().trim() }).select('+otpCode +otpExpiresAt');
    if (!customer || !customer.otpCode) return res.status(400).json({ message: 'Request an OTP first' });
    if (customer.otpExpiresAt < new Date()) return res.status(400).json({ message: 'OTP has expired' });
    if (customer.otpCode !== otp) return res.status(400).json({ message: 'Incorrect OTP' });

    customer.otpCode = undefined;
    customer.otpExpiresAt = undefined;
    await customer.save();

    res.json({ token: signToken(customer._id), customer: toPublicCustomer(customer) });
  } catch (err) {
    next(err);
  }
}

module.exports = { signup, login, me, forgotPassword, requestOtp, verifyOtp };
