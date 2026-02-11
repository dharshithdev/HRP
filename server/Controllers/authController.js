const User = require('../Models/User');
const Doctor = require('../Models/Doctor');
const Staff = require('../Models/Staff');
const Admin = require('../Models/Admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const Register = async (req, res) => {
    try {
        const { email, password, role, name, ...profileData } = req.body;

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "User already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({ email, password: hashedPassword, role });
        await user.save();

        if (role === 'Doctor') {
            await Doctor.create({ userId: user._id, name, ...profileData });
        } else if (role === 'Staff') {
            await Staff.create({ userId: user._id, name, ...profileData });
        } else if (role === 'Admin') {
            await Admin.create({ userId: user._id, name, ...profileData });
        }
        
    const token = jwt.sign(
        { id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    
    res.status(201).json({ 
        message: "User and Profile created successfully",
        token, 
        user: { id: user._id, email: user.email, role: user.role }
    });
            res.status(201).json({ message: "User and Profile created successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {Register};