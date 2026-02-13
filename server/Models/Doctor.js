const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    specialization: { type: String, required: true },
    availability: [{ 
        day: String, 
        slots: [String]     
    }],
    phone: String
});  

module.exports = mongoose.model('Doctor', doctorSchema);