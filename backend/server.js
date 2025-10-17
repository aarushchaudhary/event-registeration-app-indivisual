const path = require('path');
// Ensure dotenv is configured to find the .env file in the 'backend' directory
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const express = require('express');
const mongoose = require('mongoose');
const registrationRoutes = require('./routes/registrationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const Registration = require('./models/registration');
const Leaderboard = require('./models/leaderboard');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// API Routes
app.use('/api', registrationRoutes);
app.use('/api/admin', adminRoutes);

// General API Endpoints (mirrors the serverless function)
app.get('/api/stats', async (req, res) => {
    try {
        const registeredCount = await Registration.countDocuments();
        const totalSeats = parseInt(process.env.TOTAL_EVENT_SEATS) || 100;
        const seatsLeft = totalSeats - registeredCount;
        res.json({ registeredCount, seatsLeft: seatsLeft > 0 ? seatsLeft : 0 });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stats' });
    }
});

app.get('/api/leaderboard', async (req, res) => {
    try {
        const leaderboard = await Leaderboard.find({})
            .populate('registrationId', 'name')
            .sort({ points: -1 });
            
        const formattedLeaderboard = leaderboard.map(item => ({
            name: item.registrationId ? item.registrationId.name : 'User Not Found',
            points: item.points,
            registrationId: item.registrationId ? item.registrationId._id : null
        }));

        res.json(formattedLeaderboard);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching leaderboard' });
    }
});

// Serve HTML files for different pages
app.get('/:page?', (req, res) => {
    const page = req.params.page;
    const allowedPages = ['index', 'register', 'leaderboard', 'admin', 'rules'];
    
    if (page && allowedPages.includes(page)) {
        res.sendFile(path.join(__dirname, '..', 'frontend', `${page}.html`));
    } else if (!page) {
        res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
    }
    else {
        res.status(404).send('Page not found');
    }
});

// Database Connection and Server Start
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
})
.catch(err => console.error('Could not connect to MongoDB', err));