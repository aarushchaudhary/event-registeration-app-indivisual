    const express = require('express');
    const mongoose = require('mongoose');
    const path = require('path');
    const serverless = require('serverless-http');
    require('dotenv').config(); // Netlify handles .env differently, but this is good practice

    // Import your routes and models (adjust paths as needed)
    const registrationRoutes = require('../../backend/routes/registrationRoutes');
    const adminRoutes = require('../../backend/routes/adminRoutes');
    const Registration = require('../../backend/models/registration');
    const Leaderboard = require('../../backend/models/leaderboard');

    const app = express();

    // Connect to MongoDB
    // IMPORTANT: Use your MONGODB_URI from Netlify environment variables in production
    mongoose.connect(process.env.MONGODB_URI)
        .then(() => console.log('MongoDB Connected...'))
        .catch(err => console.error('MongoDB Connection Error:', err));

    // Middleware
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Define a base path for all API routes
    const router = express.Router();

    // Your existing routes
    router.use('/register', (req, res) => registrationRoutes(req, res)); // A simplified way to use existing router
    router.use('/admin', adminRoutes);
    
    // Your existing stat and leaderboard routes
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
    
    // Use the router for all API requests
    app.use('/api/', router);
    
    // This is the magic that makes it work with Netlify
    module.exports.handler = serverless(app);
    
