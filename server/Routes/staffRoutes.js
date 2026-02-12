const express = require('express');
const router = express.Router();

const { RegisterPatient, SearchPatients, DischargePatient, GetPatientHistory, DeletePatient,
     BookAppointment } = require('../controllers/staffController');

const { protect } = require('../Middlewares/Protect');
const {authorize} = require('../Middlewares/Role');

router.use(protect);

router.post('/register', authorize(['Staff']), RegisterPatient);

router.post('fix-appointment', BookAppointment); 

router.get('/search', authorize(['Staff', 'Doctor', 'Admin']), SearchPatients);


router.get('/history/:id', authorize(['Staff', 'Doctor']), GetPatientHistory);


router.patch('/discharge/:id', authorize(['Staff']), DischargePatient);


router.delete('/delete/:id', authorize(['Admin']), DeletePatient);

module.exports = router;