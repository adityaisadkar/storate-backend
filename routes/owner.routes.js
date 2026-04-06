const express = require('express');
const router = express.Router();
const { getOwnerDashboard } = require('../controllers/owner.controller');
const { protect, storeOwner } = require('../middleware/auth.middleware');

router.use(protect);
router.use(storeOwner);

router.get('/dashboard', getOwnerDashboard);

module.exports = router;
