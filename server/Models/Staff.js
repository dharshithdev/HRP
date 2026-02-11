const mongoose = require('mongoose');

const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    employeeId: { type: String, unique: true, required: true },
    department: { type: String, default: 'Reception' },
    phone: String,
    shift: { type: String, enum: ['Morning', 'Evening', 'Night'] }
}, { timestamps: true });

module.exports = mongoose.model('Staff', staffSchema);