const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({ 
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Admin', 'Staff', 'Doctor'], required: true },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema); 