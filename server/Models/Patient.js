const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: Number,
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    medicalHistory: [String],
    bloodGroup: String,
    contact: { type: String, required: true },
    state:{type: Boolean, required: true, default: 0}
}, { timestamps: true });

// Add an index for fast retrieval by name/phone
patientSchema.index({ name: 1, contact: 1 });

module.exports = mongoose.model('Patient', patientSchema);