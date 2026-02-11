const Appointment = require('../Models/Appointment');

const BookAppointment = async (req, res) => {
    try {
        const { patientId, doctorId, appointmentDate, timeSlot } = req.body;

        const newAppointment = new Appointment({
            patientId,
            doctorId,
            appointmentDate,
            timeSlot
        });

        await newAppointment.save();

        res.status(201).json({ message: "Appointment booked successfully!", data: newAppointment });

    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ 
                message: "Double-booking prevented! This doctor is already busy at this time." 
            });
        }
        res.status(500).json({ error: err.message });
    }
};

const CancelAppointment = async (req, res) => {
    const {id} = req.params;
    if(!id) return res.status(404).json({message: "Invalid Id"});

    const status = "Cancelled";
    const cancelledAppointment = await Appointment.findByIdAndUpdate(id, status, {new: true});

    return res.status(200).json({message: "Cancelled Successfully", cancelledAppointment});
}

module.exports = {BookAppointment, CancelAppointment};