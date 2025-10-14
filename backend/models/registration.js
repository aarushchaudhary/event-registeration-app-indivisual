const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    sapId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    year: { type: String, required: true },
    course: { type: String, required: true },
    section: { type: String, required: true },
    transactionId: { type: String, required: true, unique: true },
    paymentScreenshotPath: { type: String, required: true },
    // Hashed fields for security
    hashedSapId: { type: String, required: true },
    hashedEmail: { type: String, required: true },
    hashedTransactionId: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Registration', registrationSchema);
