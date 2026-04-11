const express = require('express');
const router = express.Router();
const {
  searchMission,
  updateMission,
  getAllMissions,
} = require('../controllers/missionController');

// Route: Search mission by two unique identifiers
// GET /api/missions/search?missionId=MSN001&operatorId=OPR101
router.get('/search', searchMission);

// Route: Update mission editable fields (business rule enforced)
// PUT /api/missions/update
router.put('/update', updateMission);

// Route: Get all missions (for reference/admin)
// GET /api/missions/all
router.get('/all', getAllMissions);

module.exports = router;
