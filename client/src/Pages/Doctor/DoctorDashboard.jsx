import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../Contexts/AuthFile';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../Components/DocSidebar'; 
import { 
  FiCalendar, FiUsers, FiClipboard, FiClock, FiArrowRight, FiActivity 
} from 'react-icons/fi';
import { motion } from 'framer-motion';

const DoctorDashboard = () => {
  const { user, logout, loading: authLoading } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/appointments/doctor/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` } 
        });
        setAppointments(response.data);
      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user?.id) fetchDoctorData();
  }, [user, authLoading]);

  const todaysDate = new Date().toDateString();
  const todaysPatientsCount = appointments.filter(app => 
    new Date(app.appointmentDate).toDateString() === todaysDate
  ).length;

  const nextAppointment = appointments.length > 0 ? appointments[0] : null;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#0b0f1a] flex flex-col items-center justify-center text-white italic gap-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="animate-pulse text-indigo-400 font-black tracking-widest text-xs uppercase">Initializing Clinic Data...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#0b0f1a]">
      <Sidebar logout={logout} />

      <main className="flex-1 h-screen overflow-y-auto p-5 sm:p-8 lg:p-12 custom-scrollbar">
        
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10 lg:mb-12">
          <div>
            <h2 className="text-2xl lg:text-3xl font-black text-white italic uppercase tracking-tighter">Welcome, Dr. {user?.name}</h2>
            <p className="text-slate-500 mt-1 text-xs lg:text-sm font-medium">Your clinical overview for {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-xl text-white shadow-xl shadow-indigo-500/20">
            {user?.name?.charAt(0)}
          </div>
        </header>

        {/* Stats Grid: 1 col on mobile, 2 on tablet, 4 on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-10">
          <StatCard title="Today's Patients" value={todaysPatientsCount} icon={<FiUsers />} color="bg-blue-500" />
          <StatCard title="Total Records" value={appointments.length} icon={<FiCalendar />} color="bg-purple-500" />
          <StatCard title="Pending Reports" value="05" icon={<FiClipboard />} color="bg-orange-500" />
          <StatCard title="Avg. Wait Time" value="15m" icon={<FiClock />} color="bg-emerald-500" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Highlighted Next Appointment */}
          <div className="xl:col-span-2 bg-white/5 border border-white/10 rounded-[2rem] lg:rounded-[2.5rem] p-6 lg:p-8 flex flex-col">
            <div className="flex justify-between items-center mb-6 lg:mb-8">
              <h3 className="text-lg lg:text-xl font-black text-white uppercase italic tracking-tighter">Next Appointment</h3>
              <button onClick={() => navigate('/doctor/appointments')} className="text-indigo-400 text-[10px] lg:text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:text-white transition-colors">
                Full Schedule <FiArrowRight />
              </button>
            </div>

            {nextAppointment ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 lg:p-8 bg-indigo-600/10 border border-indigo-500/20 rounded-[1.5rem] lg:rounded-[2rem]"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex items-center gap-4 lg:gap-6">
                    <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-2xl text-white shadow-xl shadow-indigo-600/20 font-black">
                      {nextAppointment.patientId?.name?.charAt(0) || 'P'}
                    </div>
                    <div>
                      <p className="text-xl lg:text-2xl font-black text-white leading-tight uppercase italic tracking-tighter">
                        {nextAppointment.patientId?.name || "Unregistered"}
                      </p>
                      <p className="text-indigo-400 text-xs lg:text-sm font-bold mt-1 flex items-center gap-2">
                        <FiClock className="text-indigo-500/50" /> {new Date(nextAppointment.appointmentDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {nextAppointment.timeSlot}
                      </p>
                    </div>
                  </div>

                  <div className="w-full md:w-auto px-6 py-3 bg-[#0b0f1a] rounded-xl border border-white/5 text-center">
                    <p className="text-[9px] lg:text-[10px] text-emerald-400 font-black uppercase tracking-[0.2em]">
                      Status: {nextAppointment.status}
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="py-16 border-2 border-dashed border-white/5 rounded-[2rem] flex items-center justify-center">
                <p className="text-slate-500 text-xs lg:text-sm italic font-medium uppercase tracking-widest">No upcoming schedules found.</p>
              </div>
            )}
          </div>

          {/* Health Monitor Side Panel */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2rem] lg:rounded-[2.5rem] p-8 h-full shadow-2xl shadow-indigo-900/40 relative overflow-hidden flex flex-col justify-between min-h-[300px]">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-2xl text-white mb-6">
                <FiActivity />
              </div>
              <h3 className="font-black text-xl lg:text-2xl text-white mb-3 uppercase italic tracking-tighter">Health Monitor</h3>
              <p className="text-indigo-100/70 text-sm mb-8 leading-relaxed font-medium">Analyze real-time alerts for patients with critical conditions or pending lab diagnostics.</p>
            </div>
            
            <button 
              onClick={() => navigate('/doctor/checkalerts')}
              className="relative z-10 w-full py-4 bg-white text-indigo-700 font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg hover:translate-y-[-2px] transition-all active:scale-95"
            >
              Analyze Alerts
            </button>

            {/* Visual Decoration */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-400/10 rounded-full blur-2xl"></div>
          </div>
        </div>
      </main>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white/5 border border-white/10 p-6 lg:p-7 rounded-[1.8rem] lg:rounded-[2rem] hover:bg-white/[0.08] transition-all group">
    <div className={`${color} w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl flex items-center justify-center text-xl lg:text-2xl mb-5 text-white shadow-lg group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <p className="text-slate-500 text-[9px] lg:text-[10px] font-black uppercase tracking-[0.15em] mb-1">{title}</p>
    <h3 className="text-3xl lg:text-4xl font-black text-white italic tracking-tighter">{value}</h3>
  </div>
);

export default DoctorDashboard;