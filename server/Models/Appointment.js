const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    appointmentDate: { type: Date, required: true }, // Format: YYYY-MM-DD
    timeSlot: { type: String, required: true },      // Format: "10:00 AM"
    status: { type: String, enum: ['Pending', 'Confirmed', 'Completed', "Cancelled"], default: 'Confirmed' }
});

// THE CONCURRENCY FIX: A doctor cannot have two appointments at the same date and time.
appointmentSchema.index({ doctorId: 1, appointmentDate: 1, timeSlot: 1 }, { unique: true });

module.exports = mongoose.model('Appointment', appointmentSchema);