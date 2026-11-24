const PlatformSettings = require('../models/PlatformSettings');
const PlatformBill = require('../models/PlatformBill');

// The store's subscription renews monthly on the same day-of-month it was
// created — this finds the most recent occurrence of that day on or before
// now, and the cycle a month after it.
function computeCurrentCycle(anchorDate, now = new Date()) {
  const anchorDay = anchorDate.getDate();
  let cycleStart = new Date(now.getFullYear(), now.getMonth(), anchorDay);
  if (cycleStart > now) {
    cycleStart = new Date(now.getFullYear(), now.getMonth() - 1, anchorDay);
  }
  const cycleEnd = new Date(cycleStart.getFullYear(), cycleStart.getMonth() + 1, cycleStart.getDate());
  return { cycleStart, cycleEnd };
}

async function getCurrentCycle(req, res, next) {
  try {
    const store = req.store;
    const settings = await PlatformSettings.findOne();
    const amount = settings?.planPricing?.[store.plan] ?? 0;
    const { cycleStart, cycleEnd } = computeCurrentCycle(store.createdAt);
    res.json({ amount, currency: 'INR', cycleStart, cycleEnd, plan: store.plan });
  } catch (err) {
    next(err);
  }
}

function statusFilter(status) {
  if (status && status !== 'all' && PlatformBill.BILL_STATUSES.includes(status)) return { status };
  return {};
}

async function listBills(req, res, next) {
  try {
    const bills = await PlatformBill.find(statusFilter(req.query.status)).sort({ issuedAt: -1 });
    res.json(bills);
  } catch (err) {
    next(err);
  }
}

async function exportBills(req, res, next) {
  try {
    const bills = await PlatformBill.find(statusFilter(req.query.status)).sort({ issuedAt: -1 });
    const header = ['Date issued', 'Bill number', 'Bill type', 'Payment status', 'Amount', 'Currency'];
    const rows = bills.map((b) => [
      b.issuedAt.toISOString().slice(0, 10),
      b.billNumber,
      b.billType,
      b.status,
      b.amount,
      b.currency,
    ]);
    const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="billing-history.csv"');
    res.send(csv);
  } catch (err) {
    next(err);
  }
}

module.exports = { getCurrentCycle, listBills, exportBills };
