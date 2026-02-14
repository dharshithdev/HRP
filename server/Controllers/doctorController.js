const Appointment = require('../Models/Appointment');
const Patient = require('../Models/Patient');
const Record = require("../Models/Record");
const Doctor = require("../Models/Doctor");
const Alert = require("../Models/Alert");

const GetMySchedule = async (req, res) => {
    try { 
        const { doctorId } = req.user;

        const schedule = await Appointment.find({ doctorId })
            .populate('patientId', 'name age gender bloodGroup') 
            .sort({ appointmentDate: 1, timeSlot: 1 }); 

        res.status(200).json({ count: schedule.length, schedule });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// This runs on the SERVER
const UpdateAppointmentStatus = async (req, res) => {
    try {
        const { id } = req.params; // This is the Appointment ID
        const { status } = req.body; // This will be 1 or 0 (Boolean)

        // 1. Find the appointment to get the associated Patient ID
        const appointment = await Appointment.findById(id);
        
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        // 2. Update the Patient's 'state' field
        const updatedPatient = await Patient.findByIdAndUpdate(
            appointment.patientId,
            { state: status }, // status is 1 or 0
            { returnDocument: 'after', runValidators: true }
        );

        if (!updatedPatient) {
            return res.status(404).json({ message: "Patient not found" });
        }

        res.status(200).json({ 
            message: `Patient state updated to ${status ? 'Admitted' : 'Discharged'}`, 
            patient: updatedPatient 
        });
    } catch (err) {
        console.log("Error", err.message);
        res.status(500).json({ error: err.message });
    }
};              

module.exports = { UpdateAppointmentStatus };

const GetPatientMedicalRecords = async (req, res) => {
    try {
        const { patientId } = req.params;

        const patient = await Patient.findById(patientId);
        if (!patient) return res.status(404).json({ message: "Patient not found" });

        const history = await Appointment.find({
            patientId, 
            status: 'Completed'
        }).populate('doctorId', 'name specialization');

        res.status(200).json({ patient, history });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


const UpdatePatientMedicalHistory = async (req, res) => {
    try {
        const { patientId } = req.params;
        const { diagnosis, treatmentPlan, newAllergies } = req.body;

        const updatedPatient = await Patient.findByIdAndUpdate(
            patientId,
            { 
                $push: { medicalHistory: diagnosis },   
                $addToSet: { allergies: { $each: newAllergies || [] } } 
            },
            { new: true }
        );

        if (!updatedPatient) return res.status(404).json({ message: "Patient not found" });

        res.status(200).json({ 
            message: "Medical records updated successfully", 
            medicalHistory: updatedPatient.medicalHistory 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const CreateClinicalRecord = async (req, res) => {
    try {
        const { patientId } = req.params; 
        const { doctorId, record } = req.body;

        if (!record || record.trim() === "") {
            return res.status(400).json({ message: "Record content cannot be empty" });
        }

        const newRecord = new Record({
            patientId,
            doctorId,
            record
        });

        await newRecord.save();

        res.status(201).json({ 
            message: "Clinical record saved successfully", 
            newRecord 
        });
    } catch (err) {
        console.error("Error saving record:", err.message);
        res.status(500).json({ error: err.message });
    }
};

const GetDoctorProfile = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Not authorized, user ID missing" });
        }

        const doctor = await Doctor.findOne({ userId: req.user.id })
            .populate('userId', 'email role');

        if (!doctor) {
            return res.status(404).json({ message: "Doctor profile not found" });
        }

        res.status(200).json(doctor);
    } catch (err) {
        console.error("Profile Fetch Error:", err.message);
        res.status(500).json({ error: err.message });
    }
};

const GetAlerts = async (req, res) => {
    try {
        const alerts = await Alert.find().sort({ _id: -1 });
        res.status(200).json(alerts);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch alerts: " + err.message });
    }
};

const UpdateAvailability = async (req, res) => {
    try {
        const { availability } = req.body;
        
        // Security: Ensure it's Sunday (Optional but recommended)
        const today = new Date();
        if (today.getDay() !== 0) { // 0 is Sunday
            return res.status(403).json({ message: "Availability can only be updated on Sundays." });
        }

        const updatedDoctor = await Doctor.findOneAndUpdate(
            { userId: req.user._id }, // Assuming req.user._id comes from protect middleware
            { availability: availability },
            { new: true }
        );

        if (!updatedDoctor) return res.status(404).json({ message: "Doctor record not found" });

        res.json({ message: "Schedule updated successfully!", availability: updatedDoctor.availability });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { GetMySchedule, UpdateAppointmentStatus, GetPatientMedicalRecords, UpdatePatientMedicalHistory, 
    CreateClinicalRecord, GetDoctorProfile, GetAlerts, UpdateAvailability
};