const express = require('express');
const router = express.Router();
const { GetMySchedule, UpdateAppointmentStatus, GetPatientMedicalRecords, UpdatePatientMedicalHistory } = 
    require('../Controllers/doctorController');
const {Login} = require("../Controllers/authController");
const { protect } = require('../Middlewares/Protect');
const {authorize} = require('../Middlewares/Role');


router.post('/login', Login);

router.get('/schedule', protect, authorize(['Doctor']), GetMySchedule);

router.get('/patient-records/:patientId', protect, authorize(['Doctor']), GetPatientMedicalRecords);

router.patch('/appointment-status/:id', protect, authorize(['Doctor']), UpdateAppointmentStatus);

router.patch('/update-history/:patientId', protect, authorize(['Doctor']), UpdatePatientMedicalHistory);

module.exports = router;