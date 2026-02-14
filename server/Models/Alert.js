const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
    notice: { type: String, required: true }, 
}, {timestamps: true});

module.exports = mongoose.model('Alert', alertSchema); 