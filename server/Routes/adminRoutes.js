const express = require('express');
const router = express.Router();
const {Register} = require('../Controllers/authController');
const { ViewDoctors, ToggleUserActiveStatus, ViewStaff, DeleteStaff, DeleteDoctor, ViewPatients, 
    GetAdminStats } = require('../Controllers/adminController');
 
const { protect } = require('../Middlewares/Protect');
const {authorize} = require('../Middlewares/Role');


router.post('/register', Register);
router.patch('/toggle-status/:userId', protect, authorize(['Admin']), ToggleUserActiveStatus);


router.get('/doctors', ViewDoctors);
router.delete('/doctor/:doctorId/:userId', protect, authorize(['Admin']), DeleteDoctor);


router.get('/staff', ViewStaff);
router.delete('/staff/:staffId/:userId', protect, authorize(['Admin']), DeleteStaff);

router.get('/patients', authorize(['Admin']), protect, ViewPatients);

router.get('/dashboard-stats', protect, authorize(['Admin']), GetAdminStats);

module.exports = router;