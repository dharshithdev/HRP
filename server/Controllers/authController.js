const User = require('../Models/User');
const Doctor = require('../Models/Doctor');
const Staff = require('../Models/Staff');
const Admin = require('../Models/Admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const Register = async (req, res) => {  
    try {
        const { email, password, role, name, ...profileData } = req.body;

        // 1. Check if user exists
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "User already exists" });

        // 2. Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Create User Account
        user = new User({ email, password: hashedPassword, role });
        await user.save();

        if (role === 'Doctor') {
            await Doctor.create({ userId: user._id, name, ...profileData });
        } else if (role === 'Staff') {
            await Staff.create({ userId: user._id, name, ...profileData });
        } else if (role === 'Admin') {
            await Admin.create({ userId: user._id, name, ...profileData });
        }
        
        // Return success without logging the admin out
        res.status(201).json({ 
            message: `${role} account for ${name} created successfully.` 
        });

    } catch (err) {
        console.log(err.message)
        res.status(500).json({ error: err.message });
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