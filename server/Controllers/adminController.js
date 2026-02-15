const User = require('../Models/User');
const Doctor = require('../Models/Doctor');
const Staff = require('../Models/Staff');
const Patient = require('../Models/Patient');
const Appointment = require("../Models/Appointment");
const Alerts = require("../Models/Alert");
const Admin = require('../Models/Admin');
// --- DOCTOR MANAGEMENT ---

const GetAllDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find().populate('userId', 'email isActive');
        res.status(200).json(doctors);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


const DeleteDoctor = async (req, res) => {
    try {
        const { doctorId, userId } = req.params;
        await Doctor.findByIdAndDelete(doctorId);
        await User.findByIdAndDelete(userId);
        res.status(200).json({ message: "Doctor account permanently deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const ToggleUserActiveStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        
        if (!user) return res.status(404).json({ message: "User not found" });

        user.isActive = !user.isActive;
        await user.save();

        res.status(200).json({ message: `User is now ${user.isActive ? 'Active' : 'Deactivated'}` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


const DeleteStaff = async (req, res) => {
    try {
        const { staffId, userId } = req.params;
        await Staff.findByIdAndDelete(staffId);
        await User.findByIdAndDelete(userId);
        res.status(200).json({ message: "Staff account permanently deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const DeletePatient = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedPatient = await Patient.findByIdAndDelete(id);
        if (!deletedPatient) return res.status(404).json({ message: "Patient not found" });
        
        res.status(200).json({ message: "Patient record deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const GetAdminStats = async (req, res) => {
    try {
        // 1. Fetch Quick Stats
        const totalUsers = await User.countDocuments();
        const activeDoctors = await Doctor.countDocuments();
        // Assuming 'Staff' is a role in your User model
        const staffCount = await User.countDocuments({ role: 'Staff' });
        
        // 2. Fetch Chart Data (Last 7 Days)
        const chartData = await Appointment.aggregate([
            {
                $match: {
                    createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 7)) }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    appointments: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // 3. Recent Activity (Hardcoded or from a Logs collection if you have one)
        const recentActivity = [
            { user: 'System', action: 'Active', time: 'Just now', color: 'bg-blue-500' },
            // You can fetch real recent users here
        ];

        const alertCounts = await Alerts.countDocuments();

        res.status(200).json({
            stats: {
                totalUsers,
                activeDoctors,
                staffCount,
                alerts: alertCounts// Replace with real alert count if model exists
            },
            chartData,
            recentActivity
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const GetAllStaff = async (req, res) => {
    try {
        // .populate('userId') brings in the email and role from the User model
        const staffMembers = await Staff.find().populate('userId', 'email isActive');
        res.status(200).json(staffMembers);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch staff: " + err.message });
    }
};

const GetAllAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find()
                            .populate('doctorId', 'name specialization')
                            .populate('patientId', 'name')                
                            .sort({ appointmentDate: -1 });

        res.status(200).json(appointments);
    } catch (err) {
        res.status(500).json({ error: "Fetch failed: " + err.message });
    }
};

const UpdateAppointmentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        console.log(status);
        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id, 
            { status }, 
            { new: true }
        );
        res.json(appointment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const GetAllPatients = async (req, res) => {
    try {
        const patients = await Appointment.aggregate([
            {
                // 1. Group by patientId (which exists)
                $group: {
                    _id: "$patientId", 
                    totalVisits: { $sum: 1 },
                    lastVisit: { $max: "$appointmentDate" },
                    recentDoctor: { $first: "$doctorId" }
                }
            },
            {
                // 2. Join with the Patients collection to get the name and contact
                $lookup: {
                    from: "patients", // name of the collection in MongoDB
                    localField: "_id",
                    foreignField: "_id",
                    as: "patientDetails"
                }
            },
            { $unwind: "$patientDetails" }, // Turn array into object
            {
                // 3. Clean up the output
                $project: {
                    _id: 1,
                    name: "$patientDetails.name",
                    contact: "$patientDetails.contact",
                    totalVisits: 1,
                    lastVisit: 1,
                    recentDoctor: 1
                }
            },
            { $sort: { lastVisit: -1 } }
        ]);
        
        // Populate doctor info
        const populatedData = await Appointment.populate(patients, { 
            path: 'recentDoctor', 
            select: 'name specialization' 
        });

        res.status(200).json(populatedData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const GetAdminProfile = async (req, res) => {
    try {
        const admin = await Admin.findOne({ userId: req.user.id }).populate('userId', 'email role isActive');
        
        if (!admin) {
            return res.status(404).json({ message: "Admin profile not found" });
        }

        res.status(200).json(admin);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { GetAllDoctors, ToggleUserActiveStatus, DeleteStaff, 
    DeletePatient, DeleteDoctor, GetAdminStats, GetAllStaff, GetAllAppointments, 
    UpdateAppointmentStatus, GetAllPatients, GetAdminProfile }; 