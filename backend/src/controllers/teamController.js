const bcrypt = require('bcryptjs');
const TeamMember = require('../models/TeamMember');

async function listMembers(req, res, next) {
  try {
    const members = await TeamMember.find().select('-passwordHash').sort({ createdAt: -1 });
    res.json(members);
  } catch (err) {
    next(err);
  }
}

async function createMember(req, res, next) {
  try {
    const { name, email, password, role } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const member = await TeamMember.create({ name, email, passwordHash, role });
    const { passwordHash: _omit, ...rest } = member.toObject();
    res.status(201).json(rest);
  } catch (err) {
    next(err);
  }
}

async function updateMember(req, res, next) {
  try {
    const { name, role, isActive } = req.body;
    const member = await TeamMember.findByIdAndUpdate(
      req.params.id,
      { name, role, isActive },
      { new: true, runValidators: true }
    ).select('-passwordHash');
    if (!member) return res.status(404).json({ message: 'Team member not found' });
    res.json(member);
  } catch (err) {
    next(err);
  }
}

async function deleteMember(req, res, next) {
  try {
    const member = await TeamMember.findByIdAndDelete(req.params.id);
    if (!member) return res.status(404).json({ message: 'Team member not found' });
    res.json({ message: 'Team member removed' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listMembers, createMember, updateMember, deleteMember };
