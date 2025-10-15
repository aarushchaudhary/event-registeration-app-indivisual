const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');
const multer = require('multer');

// Configure multer to use memory storage
// This is necessary to get a buffer of the file for ImageKit
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Use the upload middleware for the /register route
router.post('/register', upload.single('paymentScreenshot'), registrationController.createRegistration);

module.exports = router;