// Business structures a store owner can pick from in Settings > General —
// matches the categories Indian payment gateways (Razorpay etc.) ask for
// during their own business-verification KYC.
const BUSINESS_TYPES = [
  { key: 'individual', label: 'Individual' },
  { key: 'proprietorship', label: 'Sole Proprietorship' },
  { key: 'partnership', label: 'Partnership' },
  { key: 'llp', label: 'Limited Liability Partnership (LLP)' },
  { key: 'private_limited', label: 'Private Limited Company' },
  { key: 'public_limited', label: 'Public Limited Company' },
  { key: 'huf', label: 'Hindu Undivided Family (HUF)' },
  { key: 'ngo', label: 'NGO' },
  { key: 'trust', label: 'Trust' },
  { key: 'society', label: 'Society' },
];

module.exports = BUSINESS_TYPES;
