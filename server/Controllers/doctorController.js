const Appointment = require('../Model/Appointment');
const Patient = require('../Model/Patient');


const GetMySchedule = async (req, res) => {
    try {

        const { doctorId } = req.user; 

        const schedule = await Appointment.find({ doctorId })
            .populate('patientId', 'name age gender bloodGroup') 
            .sort({ appointmentDate: 1, timeSlot: 1 }); 

        res.status(200).json({ count: schedule.length, schedule });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const UpdateAppointmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; 

        const appointment = await Appointment.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        );

        if (!appointment) return res.status(404).json({ message: "Appointment not found" });

        res.status(200).json({ message: `Status updated to ${status}`, appointment });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const GetPatientMedicalRecords = async (req, res) => {
    try {
        const { patientId } = req.params;

        const patient = await Patient.findById(patientId);
        if (!patient) return res.status(404).json({ message: "Patient not found" });

        const history = await Appointment.find({ 
            patientId, 
            status: 'Completed' 
        }).populate('doctorId', 'name specialization');

        res.status(200).json({ patient, history });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


const UpdatePatientMedicalHistory = async (req, res) => {
    try {
        const { patientId } = req.params;
        const { diagnosis, treatmentPlan, newAllergies } = req.body;

        const updatedPatient = await Patient.findByIdAndUpdate(
            patientId,
            { 
                $push: { medicalHistory: diagnosis },   
                $addToSet: { allergies: { $each: newAllergies || [] } } 
            },
            { new: true }
        );

        if (!updatedPatient) return res.status(404).json({ message: "Patient not found" });

        res.status(200).json({ 
            message: "Medical records updated successfully", 
            medicalHistory: updatedPatient.medicalHistory 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { GetMySchedule, UpdateAppointmentStatus, GetPatientMedicalRecords, UpdatePatientMedicalHistory };