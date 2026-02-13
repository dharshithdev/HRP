const mongoose = require('mongoose');

const urgentSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: false },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    notice: { type: String, required: true }, 
});

urgentSchema.index({ doctorId: 1, appointmentDate: 1, timeSlot: 1 }, { unique: true });

module.exports = mongoose.model('Urgent', urgentSchema); 