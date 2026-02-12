const express = require('express');
const router = express.Router();

const { RegisterPatient, SearchPatients, DischargePatient, GetPatientHistory, DeletePatient } = 
require('../controllers/staffController');

const { protect } = require('../Middlewares/Protect');
const {authorize} = require('../Middlewares/Role');

// --- PATIENT MANAGEMENT ROUTES ---

router.post('/register', protect, authorize(['Staff']), RegisterPatient);


router.get('/search', protect, authorize(['Staff', 'Doctor', 'Admin']), SearchPatients);


router.get('/history/:id', protect, authorize(['Staff', 'Doctor']), GetPatientHistory);


router.patch('/discharge/:id', protect, authorize(['Staff']), DischargePatient);


router.delete('/delete/:id', protect, authorize(['Admin']), DeletePatient);

module.exports = router;