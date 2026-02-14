const express = require('express');
const router = express.Router();
const { GetMySchedule, UpdateAppointmentStatus, GetPatientMedicalRecords, UpdatePatientMedicalHistory,
    CreateClinicalRecord, GetDoctorProfile, GetAlerts, UpdateAvailability
 } = require('../Controllers/doctorController');
const {Login} = require("../Controllers/authController");
const { protect } = require('../Middlewares/Protect');
const {authorize} = require('../Middlewares/Role');
 

router.post('/login', Login);

router.get('/schedule', protect, authorize(['Doctor']), GetMySchedule);

router.get('/profile', protect, authorize(['Doctor']), GetDoctorProfile);

router.get('/patient-records/:patientId', protect, authorize(['Doctor']), GetPatientMedicalRecords);

router.patch('/appointment-status/:id/status', protect, authorize(['Doctor']), UpdateAppointmentStatus);

router.patch('/update-history/:patientId/history', protect, authorize(['Doctor']), UpdatePatientMedicalHistory);

console.log("Controller Check:", CreateClinicalRecord);
router.post('/records/:patientId', protect, authorize(['Doctor']), CreateClinicalRecord);

router.get('/alerts', protect, authorize(['Doctor']), GetAlerts);
router.put('/update-schedule', protect, authorize(['Doctor']), UpdateAvailability);
module.exports = router;