const Appointment = require('../Models/Appointment');
const mongoose = require('mongoose'); 
const Doctor = require('../Models/Doctor');

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

const GetDoctorAppointments = async (req, res) => {
    try {
        const { doctorId } = req.params; // This is actually the User ID from frontend

        const doctorProfile = await Doctor.findOne({ userId: doctorId });

        if (!doctorProfile) {
            console.log("No doctor profile found for User ID:", doctorId);
            return res.status(200).json([]); // Return empty if no profile
        }

        console.log("Found Doctor Profile ID:", doctorProfile._id);

        const appointments = await Appointment.find({ doctorId: doctorProfile._id })
            .populate('patientId', 'name') 
            .sort({ appointmentDate: 1, timeSlot: 1 });

        console.log(`Found ${appointments.length} appointments for Dr. ${doctorProfile.name}`);
        
        res.status(200).json(appointments);
    } catch (error) {
        console.error("Controller Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

module.exports = {BookAppointment, CancelAppointment, GetDoctorAppointments};