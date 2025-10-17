const express = require('express');
const router = express.Router();
const Registration = require('../models/registration');
const Leaderboard = require('../models/leaderboard');

// Stats Route
router.get('/stats', async (req, res) => {
    try {
        const registeredCount = await Registration.countDocuments();
        const totalSeats = parseInt(process.env.TOTAL_EVENT_SEATS) || 100;
        const seatsLeft = totalSeats - registeredCount;
        res.json({ registeredCount, seatsLeft: seatsLeft > 0 ? seatsLeft : 0 });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stats' });
    }
});

// Leaderboard Route
router.get('/leaderboard', async (req, res) => {
    try {
        const leaderboard = await Leaderboard.find({})
            .populate('registrationId', 'name')
            .sort({ points: -1 });
        const formatted = leaderboard.map(item => ({
            name: item.registrationId ? item.registrationId.name : 'User Not Found',
            points: item.points,
            registrationId: item.registrationId ? item.registrationId._id : null
        }));
        res.json(formatted);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching leaderboard' });
    }
});

module.exports = router;