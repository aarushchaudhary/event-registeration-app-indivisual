const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');
const { upload } = require('../middleware/uploadMiddleware');

router.post('/register', upload.single('paymentScreenshot'), registrationController.createRegistration);

module.exports = router;
