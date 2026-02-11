const Patient = require('../Models/Patient');
const Appointment = require('../Models/Appointment');

const RegisterPatient = async (req, res) => {
    try {
        const newPatient = new Patient(req.body);
        await newPatient.save();
        res.status(201).json(newPatient);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const SearchPatients = async (req, res) => {
    try {
        const { query } = req.query; 
        const patients = await Patient.find({
            $or: [
                { name: new RegExp(query, 'i') },
                { contact: query }
            ]
        }).limit(10); 
        
        res.json(patients);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const DischargePatient = async (req, res) => {
    try {
        const { id } = req.params;
        
        const patient = await Patient.findByIdAndUpdate(
            id, 
            { state: 1 }, 
            { new: true }
        );

        if (!patient) return res.status(404).json({ message: "Patient not found" });

        res.json({ message: "Patient discharged successfully", patient });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const GetPatientHistory = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) return res.status(404).json({ message: "Patient not found" });

        const appointments = await Appointment.find({ patientId: patient._id })
            .populate('doctorId', 'name specialization') 
            .sort({ appointmentDate: -1 });

        res.json({ patient, appointments });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {RegisterPatient, SearchPatients, DischargePatient, GetPatientHistory};