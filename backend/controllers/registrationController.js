const Registration = require('../models/registration');
const Leaderboard = require('../models/leaderboard');
const bcrypt = require('bcryptjs');

exports.createRegistration = async (req, res) => {
    const { name, sapId, email, year, course, section, transactionId } = req.body;

    // Basic validation
    if (!name || !sapId || !email || !year || !course || !section || !transactionId || !req.file) {
        return res.status(400).json({ success: false, message: 'All fields are mandatory.' });
    }

    try {
        // Check for uniqueness
        const existingSap = await Registration.findOne({ sapId });
        if (existingSap) return res.status(400).json({ success: false, message: 'SAP ID already registered.' });

        const existingEmail = await Registration.findOne({ email });
        if (existingEmail) return res.status(400).json({ success: false, message: 'Email already registered.' });
        
        const existingTransaction = await Registration.findOne({ transactionId });
        if (existingTransaction) return res.status(400).json({ success: false, message: 'Transaction ID already used.' });

        // Hash sensitive data
        const salt = await bcrypt.genSalt(10);
        const hashedSapId = await bcrypt.hash(sapId, salt);
        const hashedEmail = await bcrypt.hash(email, salt);
        const hashedTransactionId = await bcrypt.hash(transactionId, salt);

        const newRegistration = new Registration({
            name,
            sapId, // Store plain for searching by admin, hash if needed for extreme security
            email, // Store plain for searching by admin
            year,
            course,
            section,
            transactionId, // Store plain for searching
            hashedSapId,
            hashedEmail,
            hashedTransactionId,
            paymentScreenshotPath: req.file.path,
        });

        const savedRegistration = await newRegistration.save();

        // Add user to leaderboard with 0 points
        const newLeaderboardEntry = new Leaderboard({
            registrationId: savedRegistration._id,
            points: 0
        });
        await newLeaderboardEntry.save();
        
        res.status(201).json({ success: true, message: 'Registration successful!' });

    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ success: false, message: 'Server error during registration.' });
    }
};
