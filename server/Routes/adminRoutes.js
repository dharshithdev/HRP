const express = require('express');
const router = express.Router();
const { GetAllDoctors, ToggleUserActiveStatus, DeleteStaff, DeleteDoctor, 
    GetAdminStats, GetAllStaff, GetAllAppointments, GetAllPatients, UpdateAppointmentStatus,
    GetAdminProfile   } = require('../Controllers/adminController');
 
const { protect } = require('../Middlewares/Protect');
const {authorize} = require('../Middlewares/Role');


router.patch('/toggle-status/:userId', protect, authorize(['Admin']), ToggleUserActiveStatus);


router.get('/doctors', protect, authorize(['Admin']), GetAllDoctors);
router.delete('/doctor/:doctorId/:userId', protect, authorize(['Admin']), DeleteDoctor);


router.delete('/staff/:staffId/:userId', protect, authorize(['Admin']), DeleteStaff);


router.get('/dashboard-stats', protect, authorize(['Admin']), GetAdminStats);
router.get('/staff', protect, authorize(['Admin']), GetAllStaff);

router.get('/appointments', protect, authorize(['Admin']), GetAllAppointments);
router.patch('/appointment/:id', protect, authorize(['Admin']), UpdateAppointmentStatus);

router.get('/patients', protect, authorize(['Admin']), GetAllPatients);

router.get('/profile', protect, authorize(['Admin']), GetAdminProfile);

module.exports = router;