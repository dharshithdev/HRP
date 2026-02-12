const express = require('express');
const router = express.Router();
const {Register} = require('../Controllers/authController');
const { ViewDoctors, ToggleUserActiveStatus, ViewStaff, DeleteStaff, DeleteDoctor, ViewPatients 
    } = require('../Controllers/adminController');

const { protect } = require('../Middlewares/Protect');
const {authorize} = require('../Middlewares/Role');

router.use(protect);
router.use(authorize(['Admin']));


router.post('/register', Register);
router.patch('/toggle-status/:userId', ToggleUserActiveStatus);


router.get('/doctors', ViewDoctors);
router.delete('/doctor/:doctorId/:userId', DeleteDoctor);


router.get('/staff', ViewStaff);
router.delete('/staff/:staffId/:userId', DeleteStaff);

router.get('/patients', ViewPatients);

module.exports = router;