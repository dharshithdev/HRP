const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    record: { type: String, required: true },
}, { timestamps: true }); // Timestamps will automatically add 'createdAt'

module.exports = mongoose.model('Record', recordSchema);