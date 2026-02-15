const cors = require("cors");
const express = require("express");
require("dotenv").config();
const connectToDB = require("./Config/Connect");

const AdminRoutes = require("./Routes/adminRoutes");
const AuthRoutes = require("./Routes/authRoutes");
const StaffRoutes = require("./Routes/staffRoutes");
const DoctorRoutes = require("./Routes/doctorRoutes");
const appointmentRoutes = require('./Routes/appointmentRoutes');

const app = express();
 
// Middleware
process.env.NODE_ENV == 'development' ? app.use(cors()) : app.use(cors({ origin: "https://hrp-seven.vercel.app", credentials: true}));

app.use(express.json());  

// Routes
app.use("/api/auth", AuthRoutes);
app.use("/api/admin", AdminRoutes);
app.use("/api/doctor", DoctorRoutes);
app.use("/api/staff", StaffRoutes); 
app.use('/api/appointments', appointmentRoutes);

app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

const PORT = process.env.PORT || 5000;

connectToDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
});