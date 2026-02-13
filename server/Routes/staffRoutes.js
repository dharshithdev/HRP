const express = require('express');
const router = express.Router();

const { RegisterPatient, SearchPatients, DischargePatient, GetPatientHistory, DeletePatient,
     BookAppointment, GetStaffDashboardStats } = require('../controllers/staffController');

const { protect } = require('../Middlewares/Protect');
const {authorize} = require('../Middlewares/Role');

router.use(protect); 

router.post('/register', authorize(['Staff']), RegisterPatient);

router.post('fix-appointment', BookAppointment); 

router.get('/patients/search', protect, authorize(['Staff']), SearchPatients);

router.get('/dashboard-stats', authorize(['Staff']), GetStaffDashboardStats);


router.get('/patients/history/:id', protect, authorize(['Staff']), GetPatientHistory);

router.patch('/discharge/:id', authorize(['Staff']), DischargePatient);


router.delete('/delete/:id', authorize(['Admin']), DeletePatient);

module.exports = router;