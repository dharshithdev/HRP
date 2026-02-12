const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: Number,
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    medicalHistory: [String], 
    allergies: [String], 
    bloodGroup: String,
    contact: { type: String, required: true },
    state: { type: Boolean, required: true, default: 0 }
}, { timestamps: true }); 

patientSchema.index({ name: 1, contact: 1 });

module.exports = mongoose.model('Patient', patientSchema);