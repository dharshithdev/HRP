const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    accessLevel: { type: String, default: 'SuperAdmin' }, // e.g., for future-proofing
    managedDepartments: [String]
}, { timestamps: true });

module.exports = mongoose.model('Admin', adminSchema);