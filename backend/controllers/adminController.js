const jwt = require('jsonwebtoken');
const exceljs = require('exceljs');
const Registration = require('../models/registration');
const Leaderboard = require('../models/leaderboard');

// Admin Login
exports.login = (req, res) => {
    const { username, password } = req.body;

    if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PASS) {
        const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ success: true, token });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
};

// Get all registered students
exports.getRegistrations = async (req, res) => {
    try {
        const registrations = await Registration.find({}).select('-__v');
        res.json(registrations);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update leaderboard points
exports.updateLeaderboard = async (req, res) => {
    const { registrationId, pointsToAdd } = req.body;
    try {
        const registration = await Registration.findById(registrationId);
        if (!registration) {
            return res.status(404).json({ success: false, message: 'Registration not found' });
        }

        let leaderboardEntry = await Leaderboard.findOne({ registrationId });

        if (leaderboardEntry) {
            leaderboardEntry.points += pointsToAdd;
        } else {
            // If a student is registered but not on leaderboard, this creates their entry
            leaderboardEntry = new Leaderboard({
                registrationId,
                points: pointsToAdd,
            });
        }

        await leaderboardEntry.save();
        res.json({ success: true, message: 'Leaderboard updated' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while updating points' });
    }
};

// New function to delete a registration
exports.deleteRegistration = async (req, res) => {
    try {
        const { id } = req.params;
        const registration = await Registration.findById(id);

        if (!registration) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        // Delete the user from the registrations collection
        await Registration.findByIdAndDelete(id);

        // Also delete the user from the leaderboard
        await Leaderboard.deleteOne({ registrationId: id });

        res.json({ success: true, message: 'User deleted successfully.' });

    } catch (error) {
        console.error("Deletion Error:", error);
        res.status(500).json({ success: false, message: 'Server error while deleting user.' });
    }
};

// Export registrations to Excel
exports.exportRegistrations = async (req, res) => {
    try {
        const registrations = await Registration.find({}).lean();
        const workbook = new exceljs.Workbook();
        const worksheet = workbook.addWorksheet('Registrations');

        worksheet.columns = [
            { header: 'Name', key: 'name', width: 30 },
            { header: 'SAP ID', key: 'sapId', width: 20 },
            { header: 'Email', key: 'email', width: 40 },
            { header: 'Year', key: 'year', width: 10 },
            { header: 'Course', key: 'course', width: 40 },
            { header: 'Section', key: 'section', width: 15 },
            { header: 'Transaction ID', key: 'transactionId', width: 30 },
        ];
        
        registrations.forEach(reg => {
            worksheet.addRow(reg);
        });

        res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition','attachment; filename=registrations.xlsx');

        await workbook.xlsx.write(res);
        //res.end();

    } catch (error) {
        console.error("Export Error:", error);
        res.status(500).json({ success: false, message: 'Failed to export data' });
    }
};

// Export leaderboard to Excel
exports.exportLeaderboard = async (req, res) => {
     try {
        const leaderboardData = await Leaderboard.find({})
            .populate('registrationId', 'name sapId') // Get name and SAP ID from Registration
            .sort({ points: -1 })
            .lean();

        const workbook = new exceljs.Workbook();
        const worksheet = workbook.addWorksheet('Leaderboard');

        worksheet.columns = [
            { header: 'Rank', key: 'rank', width: 10 },
            { header: 'Name', key: 'name', width: 30 },
            { header: 'SAP ID', key: 'sapId', width: 20 },
            { header: 'Points', key: 'points', width: 15 },
        ];

        leaderboardData.forEach((player, index) => {
            worksheet.addRow({
                rank: index + 1,
                name: player.registrationId ? player.registrationId.name : 'N/A',
                sapId: player.registrationId ? player.registrationId.sapId : 'N/A',
                points: player.points
            });
        });
        
        res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition','attachment; filename=leaderboard.xlsx');

        await workbook.xlsx.write(res);
        //res.end();

    } catch (error) {
        console.error("Export Error:", error);
        res.status(500).json({ success: false, message: 'Failed to export leaderboard data' });
    }
};