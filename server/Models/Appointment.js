const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    appointmentDate: { type: Date, required: true }, 
    timeSlot: { type: String, required: true },      
    status: { type: String, enum: ['Pending', 'Confirmed', 'Completed', "Cancelled"], default: 'Confirmed' }
}, {timestamps: true});

appointmentSchema.index({ doctorId: 1, appointmentDate: 1, timeSlot: 1 }, { unique: true });

module.exports = mongoose.model('Appointment', appointmentSchema); 