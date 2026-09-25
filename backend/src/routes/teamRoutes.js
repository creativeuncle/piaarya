const express = require('express');
const { listMembers, createMember, updateMember, deleteMember } = require('../controllers/teamController');
const TeamMember = require('../models/TeamMember');
const { requireAdminAuth, requireRole } = require('../middleware/adminAuth');

const router = express.Router();

router.use(requireAdminAuth);

router.get('/roles', (req, res) => res.json(TeamMember.ROLES));
router.get('/', listMembers);
// Only super_admin can add/change/remove team members — otherwise a manager
// could grant themselves super_admin through this same endpoint.
router.post('/', requireRole('super_admin'), createMember);
router.put('/:id', requireRole('super_admin'), updateMember);
router.delete('/:id', requireRole('super_admin'), deleteMember);

module.exports = router;
