const Appointment = require('../Models/Appointment');
const mongoose = require('mongoose'); 
const Doctor = require('../Models/Doctor');
const Patient = require('../Models/Patient');

const BookAppointment = async (req, res) => {
    try {
        const { patientId, doctorId, appointmentDate, timeSlot } = req.body;

        const newAppointment = new Appointment({
            patientId,
            doctorId,
            appointmentDate,
            timeSlot
        });

        await newAppointment.save();

        res.status(201).json({ message: "Appointment booked successfully!", data: newAppointment });

    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ 
                message: "Double-booking prevented! This doctor is already busy at this time." 
            });
        }
        res.status(500).json({ error: err.message });
    }
};

const CancelAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        
        const appointment = await Appointment.findById(id);
        if (!appointment) return res.status(404).json({ message: "Appointment not found" });

        await Appointment.findByIdAndDelete(id);

        return res.status(200).json({ 
            message: "Appointment cancelled and slot is now available." 
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Backend Controller
const GetDoctorAppointments = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const doctorProfile = await Doctor.findOne({ userId: doctorId });

        const appointments = await Appointment.find({ doctorId: doctorProfile._id })
            // ADDED: gender, bloodGroup, allergies, and medicalHistory here
            .populate('patientId', 'name gender bloodGroup allergies medicalHistory') 
            .sort({ appointmentDate: 1, timeSlot: 1 });

        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {BookAppointment, CancelAppointment, GetDoctorAppointments};