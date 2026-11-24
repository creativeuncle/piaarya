const mongoose = require('mongoose');

// 'super_admin' is reserved for the store owner (the account created at
// signup) — it's never offered as a role to assign someone, it just gates
// team management itself (see requireRole('super_admin') in teamRoutes.js).
// The rest are the roles an owner can actually hand out, matching Shopify's
// staff-role picker.
const ROLES = [
  'super_admin',
  'customer_support',
  'marketer',
  'merchandiser',
  'online_store_editor',
  'store_administrator',
  'store_user_administrator',
];

// What GET /api/team/roles returns for the role picker — everything except
// the owner-only role above.
const SELECTABLE_ROLES = ROLES.filter((r) => r !== 'super_admin');

const teamMemberSchema = new mongoose.Schema(
  {
    store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ROLES, default: 'customer_support' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

teamMemberSchema.index({ store: 1, email: 1 }, { unique: true });

teamMemberSchema.statics.ROLES = ROLES;
teamMemberSchema.statics.SELECTABLE_ROLES = SELECTABLE_ROLES;

module.exports = mongoose.model('TeamMember', teamMemberSchema);
