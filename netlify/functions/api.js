const express = require('express');
const mongoose = require('mongoose');
const serverless = require('serverless-http');
require('dotenv').config();

// Import your routes
const registrationRoutes = require('../../backend/routes/registrationRoutes');
const adminRoutes = require('../../backend/routes/adminRoutes');
const Registration = require('../../backend/models/registration');
const Leaderboard = require('../../backend/models/leaderboard');

const app = express();

// Create a router for the API
const apiRouter = express.Router();

// Connect to MongoDB
// This connection should ideally be managed to avoid re-connecting on every function invocation,
// but this setup works for most hobby-tier applications.
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- ROUTES ---
// The redirect in netlify.toml maps /api/* to this function's root.
// Example: A frontend request to /api/register will be handled by the '/' route in registrationRoutes.
app.use('/api', registrationRoutes);
app.use('/api/admin', adminRoutes);

// General API Endpoints
apiRouter.get('/stats', async (req, res) => {
    try {
        const registeredCount = await Registration.countDocuments();
        const totalSeats = parseInt(process.env.TOTAL_EVENT_SEATS) || 100;
        const seatsLeft = totalSeats - registeredCount;
        res.json({ registeredCount, seatsLeft: seatsLeft > 0 ? seatsLeft : 0 });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stats' });
    }
});

apiRouter.get('/leaderboard', async (req, res) => {
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

app.use('/api/', apiRouter);


// Export the handler for Netlify
// Define which MIME types are binary
const binaryMimeTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

// Pass the binary types config to the serverless handler
module.exports.handler = serverless(app, {
    binary: binaryMimeTypes
});