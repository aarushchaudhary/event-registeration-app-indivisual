const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
    registrationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Registration',
        required: true,
        unique: true
    },
    points: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Leaderboard', leaderboardSchema);
