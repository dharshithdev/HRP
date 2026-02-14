const User = require('../Models/User');
const Doctor = require('../Models/Doctor');
const Staff = require('../Models/Staff');
const Admin = require('../Models/Admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const Register = async (req, res) => {
    try {
        const { email, password, role, name, ...profileData } = req.body;

        // 1. Validation
        if (!email || !password || !role || !name) {
            return res.status(400).json({ message: "Please fill all required fields." });
        }

        // 2. Check if user already exists
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "Email already registered." });

        // 3. Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Create Main User Account
        user = new User({ 
            email, 
            password: hashedPassword, 
            role 
        });
        await user.save();

        // 5. Create Profile based on Role
        // profileData contains extra fields like employeeId, specialization, etc.
        try {
            if (role === 'Doctor') {
                await Doctor.create({ 
                    userId: user._id, 
                    name, 
                    specialization: profileData.specialization,
                    phone: profileData.phone,
                    availability: [] // Initialize empty for now
                });
            } else if (role === 'Staff') {
                await Staff.create({ 
                    userId: user._id, 
                    name, 
                    employeeId: profileData.employeeId,
                    department: profileData.department,
                    shift: profileData.shift,
                    phone: profileData.phone
                });
            } else if (role === 'Admin') {
                await Admin.create({ 
                    userId: user._id, 
                    name 
                });
            }
        } catch (profileError) {
            // Rollback: Delete the user account if profile creation fails
            await User.findByIdAndDelete(user._id);
            throw profileError;
        }

        res.status(201).json({ 
            message: `${role} account for ${name} created successfully.` 
        });

    } catch (err) {
        console.error("Registration Error:", err.message);
        res.status(500).json({ error: "Server Error: " + err.message });
    }
};

const Login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid Email or Password" });
        }

        if (!user.isActive) {
            return res.status(403).json({ 
                message: "Account deactivated. Please contact the administrator." 
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid Email or Password" });
        }

        let profile = null;
        if (user.role === 'Doctor') {
            profile = await Doctor.findOne({ userId: user._id });
        } else if (user.role === 'Staff') {
            profile = await Staff.findOne({ userId: user._id });
        } else if (user.role === 'Admin') {
            profile = await Admin.findOne({ userId: user._id });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role, profileId: profile ? profile._id : null },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({ token, user: { id: user._id, email: user.email, role: user.role,
                name: profile ? profile.name : "Admin"
            }
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {Register, Login};