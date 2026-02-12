const User = require('../Models/User');
const Doctor = require('../Models/Doctor');
const Staff = require('../Models/Staff');
const Patient = require('../Models/Patient');

// --- DOCTOR MANAGEMENT ---

const ViewDoctors = async (req, res) => {
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

// --- STAFF MANAGEMENT ---

const ViewStaff = async (req, res) => {
    try {
        const staff = await Staff.find().populate('userId', 'email isActive');
        res.status(200).json(staff);
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

// --- PATIENT MANAGEMENT ---

const ViewPatients = async (req, res) => {
    try {
        const patients = await Patient.find();
        res.status(200).json(patients);
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

module.exports = { ViewDoctors, ToggleUserActiveStatus, ViewStaff, DeleteStaff, ViewPatients, 
    DeletePatient };