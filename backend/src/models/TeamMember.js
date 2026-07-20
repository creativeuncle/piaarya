const mongoose = require('mongoose');

const ROLES = ['super_admin', 'manager', 'support_staff'];

const teamMemberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ROLES, default: 'support_staff' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

teamMemberSchema.statics.ROLES = ROLES;

module.exports = mongoose.model('TeamMember', teamMemberSchema);
