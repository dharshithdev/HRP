const express = require('express');
const router = express.Router();

const { RegisterPatient, SearchPatients, GetPatientHistory, DeletePatient,
     BookAppointment, GetStaffDashboardStats, GetAllDoctors, GetAvailableSlots, CreateAlert,
     GetAllAppointments, UpdateStatus, GetTodayQueue } = require('../Controllers/staffController');

const { protect } = require('../Middlewares/Protect');
const {authorize} = require('../Middlewares/Role');

router.use(protect); 

router.post('/register', authorize(['Staff']), RegisterPatient);

router.get('/patients/search', protect, authorize(['Staff']), SearchPatients);

router.get('/dashboard-stats', authorize(['Staff']), GetStaffDashboardStats);


router.get('/patients/history/:id', protect, authorize(['Staff']), GetPatientHistory);

router.get('/doctor-records', protect, authorize(['Staff']), GetAllDoctors);

router.get('/appointments/available-slots', protect, authorize(['Staff']), GetAvailableSlots);

router.post('/appointments/book', protect, authorize(['Staff']), BookAppointment);

router.post('/alerts', protect, authorize(['Staff']), CreateAlert);

router.delete('/delete/:id', authorize(['Admin']), DeletePatient);
router.get('/dashboard/queue', protect, authorize(['Staff']), GetTodayQueue);
router.get('/appointments', protect, authorize(['Staff']), GetAllAppointments);
router.patch('/appointments/:id', protect, authorize(['Staff']), UpdateStatus);

module.exports = router;