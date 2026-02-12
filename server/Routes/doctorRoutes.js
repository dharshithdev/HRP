const express = require('express');
const router = express.Router();
const { 
    GetMySchedule, UpdateAppointmentStatus, GetPatientMedicalRecords, UpdatePatientMedicalHistory } = 
    require('../Controllers/doctorController');

const { protect } = require('../Middlewares/Protect');
const {authorize} = require('../Middlewares/Role');

// --- DOCTOR ROUTES ---

// 1. Get schedule (Only for the logged-in doctor)
router.get('/schedule', protect, authorize(['Doctor']), GetMySchedule);

// 2. View medical history of a specific patient
router.get('/patient-records/:patientId', protect, authorize(['Doctor']), GetPatientMedicalRecords);

// 3. Update status of an appointment (Completed/Cancelled)
router.patch('/appointment-status/:id', protect, authorize(['Doctor']), UpdateAppointmentStatus);

// 4. Add new diagnosis or allergies to patient history
router.patch('/update-history/:patientId', protect, authorize(['Doctor']), UpdatePatientMedicalHistory);

module.exports = router;