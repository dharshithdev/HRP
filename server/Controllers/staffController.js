const Patient = require('../Models/Patient'); // Ensure lowercase if folder is lowercase
const Appointment = require('../Models/Appointment');
const Doctor = require('../Models/Doctor');
const Alert = require('../Models/Alert');

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
        const doctors = await Doctor.find()
            .populate('userId', 'email isActive')
            .sort({ name: 1 }); // Alphabetical order

        res.status(200).json(doctors);
    } catch (err) {
        console.error("Error fetching doctors:", err.message);
        res.status(500).json({ error: "Server error while fetching doctor records" });
    }
};

const GetAvailableSlots = async (req, res) => {
    try {
        const { doctorId, date } = req.query; // date should be YYYY-MM-DD
        
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) return res.status(404).json({ message: "Doctor not found" });

        // 1. Get the day of the week from the requested date
        const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date(date));

        // 2. Find the doctor's defined schedule for that day
        const daySchedule = doctor.availability.find(a => a.day === dayName);
        
        if (!daySchedule) {
            return res.json({ slots: [], message: "Doctor does not work on this day" });
        }

        // 3. Find existing appointments for this doctor on this day
        const bookedAppointments = await Appointment.find({
            doctorId,
            appointmentDate: new Date(date),
            status: { $ne: 'Cancelled' }
        }).select('timeSlot');

        const bookedSlots = bookedAppointments.map(app => app.timeSlot);

        // 4. Filter out booked slots from the doctor's total availability
        const availableSlots = daySchedule.slots.filter(slot => !bookedSlots.includes(slot));

        res.json({ availableSlots });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const CreateAlert = async (req, res) => {
    try {
        const { notice } = req.body;

        if (!notice || notice.trim() === "") {
            return res.status(400).json({ message: "Notice content cannot be empty" });
        }

        const newAlert = new Alert({ notice });
        await newAlert.save();

        res.status(201).json({ message: "Alert broadcasted successfully", alert: newAlert });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const GetAllAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .populate('patientId', 'name contact bloodGroup') // Get specific patient fields
            .populate('doctorId', 'name specialization')     // Get specific doctor fields
            .sort({ appointmentDate: -1, timeSlot: 1 });     // Sort by date (newest first)

        res.status(200).json(appointments);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch appointments: " + err.message });
    }
};

const UpdateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const updated = await Appointment.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        res.status(200).json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get upcoming appointments for the current day
const GetTodayQueue = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const queue = await Appointment.find({
            appointmentDate: { $gte: today, $lt: tomorrow },
            status: 'Confirmed'
        })
        .populate('patientId', 'name')
        .populate('doctorId', 'name')
        .sort({ timeSlot: 1 }) // Sorting by time
        .limit(5); // Just get the next 5

        res.json(queue);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { RegisterPatient, SearchPatients, GetPatientHistory, DeletePatient,
     BookAppointment, GetStaffDashboardStats, GetAllDoctors, GetAvailableSlots, CreateAlert,
     GetAllAppointments, UpdateStatus, GetTodayQueue };