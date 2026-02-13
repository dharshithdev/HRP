const express = require('express');
const router = express.Router();
const { GetDoctorAppointments } = require('../Controllers/appointmentController');
const { protect } = require('../Middlewares/Protect');

router.get('/doctor/:doctorId', protect, GetDoctorAppointments); 

module.exports = router;