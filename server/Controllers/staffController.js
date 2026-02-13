const Patient = require('../Models/Patient'); // Ensure lowercase if folder is lowercase
const Appointment = require('../Models/Appointment');
const Doctor = require('../Models/Doctor');

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
        let patients;

        if (!query) {
            patients = await Patient.find().sort({ createdAt: -1 });
        } else {
            patients = await Patient.find({
                $or: [
                    { name: new RegExp(query, 'i') },
                    { contact: new RegExp(query, 'i') } // regex for partial contact matches
                ]
            });
        }
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

// controllers/staffController.js
const GetStaffDashboardStats = async (req, res) => {
    try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const currentDay = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());

        const [todayPatients, totalAppointments, totalDoctors, availableDoctorsCount] = await Promise.all([
            Patient.countDocuments({ createdAt: { $gte: todayStart } }),
            Appointment.countDocuments(),
            Doctor.countDocuments(),
            // Query doctors where the availability array contains an object with the current day
            Doctor.countDocuments({ "availability.day": currentDay })
        ]);

        res.status(200).json({ 
            todayPatients, 
            totalAppointments, 
            availableDoctors: `${availableDoctorsCount}/${totalDoctors}` 
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
};

const GetAllDoctors = async (req, res) => {
    try {
        // .populate allows us to get the 'email' and 'isActive' status from the User model
        const doctors = await Doctor.find()
            .populate('userId', 'email isActive')
            .sort({ name: 1 }); // Alphabetical order

        res.status(200).json(doctors);
    } catch (err) {
        console.error("Error fetching doctors:", err.message);
        res.status(500).json({ error: "Server error while fetching doctor records" });
    }
};

module.exports = { RegisterPatient, SearchPatients, DischargePatient, GetPatientHistory, DeletePatient,
     BookAppointment, GetStaffDashboardStats, GetAllDoctors };