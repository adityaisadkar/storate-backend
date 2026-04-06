const express = require('express');
const router = express.Router();
const { getStoresForUser, submitRating } = require('../controllers/user.controller');
const { protect, normalUser } = require('../middleware/auth.middleware');

router.use(protect);
router.use(normalUser);

router.get('/stores', getStoresForUser);
router.post('/rate', submitRating);

module.exports = router;
