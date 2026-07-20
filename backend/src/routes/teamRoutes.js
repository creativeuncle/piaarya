const express = require('express');
const { listMembers, createMember, updateMember, deleteMember } = require('../controllers/teamController');
const TeamMember = require('../models/TeamMember');

const router = express.Router();

router.get('/roles', (req, res) => res.json(TeamMember.ROLES));
router.get('/', listMembers);
router.post('/', createMember);
router.put('/:id', updateMember);
router.delete('/:id', deleteMember);

module.exports = router;
