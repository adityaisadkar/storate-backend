const express = require('express');
const router = express.Router();
const { addStore, addUser, getDashboardStats, getStores, getUsers } = require('../controllers/admin.controller');
const { protect, admin } = require('../middleware/auth.middleware');

router.use(protect);
router.use(admin);

router.get('/stats', getDashboardStats);
router.get('/users', getUsers);
router.get('/stores', getStores);
router.post('/add-user', addUser);
router.post('/add-store', addStore);

module.exports = router;
