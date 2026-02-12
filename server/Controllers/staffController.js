const Patient = require('../Models/Patient'); // Ensure lowercase if folder is lowercase
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

const BookAppointment = async (req, res) => {
    try {
        const { patientId, doctorId, appointmentDate, timeSlot } = req.body;

        const patientExists = await Patient.findById(patientId);
        const doctorExists = await Doctor.findById(doctorId);

        if (!patientExists || !doctorExists) {
            return res.status(404).json({ message: "Patient or Doctor not found" });
        }

        const existingAppointment = await Appointment.findOne({
            doctorId,
            appointmentDate,
            timeSlot,
            status: { $ne: 'Cancelled' } 
        });

        if (existingAppointment) {
            return res.status(400).json({ 
                message: "This time slot is already booked for this doctor." 
            });
        }

        const newAppointment = new Appointment({
            patientId,
            doctorId,
            appointmentDate,
            timeSlot,
            status: 'Confirmed'
        });

        await newAppointment.save();

        res.status(201).json({
            message: "Appointment booked successfully",
            appointment: newAppointment
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
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

const DeletePatient = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ message: "Invalid Patient ID" });

        const deletedPatient = await Patient.findByIdAndDelete(id);
        
        if (!deletedPatient) {
            return res.status(404).json({ message: "Patient not found" });
        }

        // PRO LOGIC: Delete all appointments associated with this patient
        await Appointment.deleteMany({ patientId: id });

        return res.status(200).json({ message: "Patient and associated records successfully deleted" });
    } catch (error) {
        console.error("Error deleting Patient: ", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = { RegisterPatient, SearchPatients, DischargePatient, GetPatientHistory, DeletePatient, BookAppointment };