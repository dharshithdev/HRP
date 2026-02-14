import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../Contexts/AuthFile';
import StaffSidebar from '../../Components/StaffSidebar';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCalendar, FiClock, FiUser, FiActivity, FiX, FiCheckCircle, FiChevronRight } from 'react-icons/fi';

const AllAppointments = () => {
  const { logout } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAppointments(); }, []);

  const fetchAppointments = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/staff/appointments`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAppointments(res.data);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await axios.patch(`${process.env.REACT_APP_API_URL}/api/staff/appointments/${id}`, { status }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchAppointments();
      setSelectedApp(null);
    } catch (err) { alert("Update failed"); }
  };

  return (
    <div className="flex min-h-screen bg-[#060910] text-white">
      <StaffSidebar logout={logout} />
      <main className="flex-1 flex overflow-hidden h-screen">
        
        {/* LEFT SIDE: LIST */}
        <div className={`p-8 overflow-y-auto transition-all duration-500 ${selectedApp ? 'w-2/5' : 'w-full'}`}>
          <header className="mb-10">
            <h2 className="text-4xl font-black italic tracking-tighter">APPOINTMENTS</h2>
            <p className="text-slate-500 mt-2">Manage clinical schedule and patient visits</p>
          </header>

          <div className="space-y-3">
            {appointments.map(app => (
              <div key={app._id} onClick={() => setSelectedApp(app)}
                className={`p-5 rounded-[2rem] border cursor-pointer flex justify-between items-center transition-all ${
                  selectedApp?._id === app._id ? 'bg-indigo-600 border-indigo-400' : 'bg-white/5 border-white/5 hover:border-white/20'
                }`}>
                <div className="flex items-center gap-4">
                  <div className="bg-black/20 px-3 py-2 rounded-xl text-[10px] font-black">{app.timeSlot}</div>
                  <div>
                    <h4 className="font-bold text-sm">{app.patientId?.name}</h4>
                    <p className="text-[10px] opacity-50 uppercase font-black">DR. {app.doctorId?.name}</p>
                  </div>
                </div>
                <StatusTag status={app.status} />
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE: DETAILS */}
        <AnimatePresence>
          {selectedApp && (
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              className="w-3/5 bg-[#0b0f1a] border-l border-white/10 p-12 relative overflow-y-auto">
              <button onClick={() => setSelectedApp(null)} className="absolute top-10 right-10 text-slate-500 hover:text-white"><FiX size={30}/></button>
              
              <div className="mb-12">
                <span className="text-indigo-500 font-black tracking-widest text-[10px] uppercase">Appointment Insight</span>
                <h2 className="text-5xl font-black italic mt-2">{selectedApp.patientId?.name}</h2>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-12">
                <InfoCard icon={<FiCalendar/>} label="Date" value={new Date(selectedApp.appointmentDate).toDateString()} />
                <InfoCard icon={<FiClock/>} label="Time" value={selectedApp.timeSlot} />
                <InfoCard icon={<FiActivity/>} label="Doctor" value={`Dr. ${selectedApp.doctorId?.name}`} />
                <InfoCard icon={<FiUser/>} label="Contact" value={selectedApp.patientId?.contact} />
              </div>

              <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5">
                <h4 className="font-bold mb-6">Update Visit Status</h4>
                <div className="flex gap-4">
                  <button onClick={() => handleStatusUpdate(selectedApp._id, 'Completed')} className="flex-1 bg-emerald-600 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-emerald-500 transition-all">
                    <FiCheckCircle/> Complete
                  </button>
                  <button onClick={() => handleStatusUpdate(selectedApp._id, 'Cancelled')} className="flex-1 bg-red-600/10 text-red-500 border border-red-500/20 py-4 rounded-2xl font-black hover:bg-red-600 hover:text-white transition-all">
                    Cancel visit
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

// Sub-components
const InfoCard = ({ icon, label, value }) => (
  <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
    <div className="flex items-center gap-2 text-indigo-400 text-[10px] font-black uppercase mb-2">{icon} {label}</div>
    <p className="text-lg font-bold">{value}</p>
  </div>
);

const StatusTag = ({ status }) => {
  const styles = {
    Confirmed: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    Completed: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    Cancelled: "text-red-400 bg-red-400/10 border-red-400/20"
  };
  return <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border ${styles[status]}`}>{status}</span>;
}

export default AllAppointments;