const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/login', adminController.login);
router.get('/registrations', authMiddleware, adminController.getRegistrations);
router.post('/leaderboard', authMiddleware, adminController.updateLeaderboard);
router.get('/export/registrations', authMiddleware, adminController.exportRegistrations);
router.get('/export/leaderboard', authMiddleware, adminController.exportLeaderboard);

module.exports = router;
