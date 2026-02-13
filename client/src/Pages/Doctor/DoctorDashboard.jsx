import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../Contexts/AuthFile';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../Components/DocSidebar'; 
import { 
  FiCalendar, FiUsers, FiClipboard, FiClock, FiArrowRight 
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
        const response = await axios.get(`http://localhost:5000/api/appointments/doctor/${user.id}`, {
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

  // Calculations for Stats
  const todaysDate = new Date().toDateString();
  const todaysPatientsCount = appointments.filter(app => 
    new Date(app.appointmentDate).toDateString() === todaysDate
  ).length;

  // Get only the next single appointment
  const nextAppointment = appointments.length > 0 ? appointments[0] : null;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#0b0f1a] flex items-center justify-center text-white italic">
        <div className="animate-pulse text-indigo-400">Loading Clinic Data...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0b0f1a]">
      <Sidebar logout={logout} />

      <main className="flex-1 h-screen overflow-y-auto p-8 custom-scrollbar">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-bold text-white">Welcome back, Dr. {user?.name}</h2>
            <p className="text-slate-400 mt-1 text-sm">Everything looks set for your schedule today.</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-indigo-500/20">
            {user?.name?.charAt(0)}
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard title="Today's Patients" value={todaysPatientsCount} icon={<FiUsers />} color="bg-blue-500" />
          <StatCard title="Total Records" value={appointments.length} icon={<FiCalendar />} color="bg-purple-500" />
          <StatCard title="Pending Reports" value="05" icon={<FiClipboard />} color="bg-orange-500" />
          <StatCard title="Avg. Wait Time" value="15m" icon={<FiClock />} color="bg-emerald-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Highlighted Next Appointment */}
        {/* Highlighted Next Appointment - Reduced Height Version */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-[2rem] p-7 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">Next Patient</h3>
            <button onClick={() => navigate('/doctor/appointments')} className="text-indigo-400 text-sm font-bold flex items-center gap-2 hover:underline">
              Full Schedule <FiArrowRight />
            </button>
          </div>

          {nextAppointment ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-indigo-600/10 border border-indigo-500/20 rounded-3xl"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  {/* Smaller Avatar */}
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500 flex items-center justify-center text-xl text-white shadow-lg shadow-indigo-500/20 font-black">
                    {nextAppointment.patientId?.name?.charAt(0) || 'P'}
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white leading-tight">
                      {nextAppointment.patientId?.name || "Unregistered Patient"}
                    </p>
                    <p className="text-indigo-400 text-sm font-medium">
                      {new Date(nextAppointment.appointmentDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {nextAppointment.timeSlot}
                    </p>
                  </div>
                </div>

                {/* Compact Status Tag */}
                <div className="px-4 py-2 bg-[#0b0f1a] rounded-xl border border-white/5">
                  <p className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.2em]">
                    {nextAppointment.status}
                  </p>
                </div>
              </div>

              {/* Streamlined Action Buttons */}
              <div className="mt-6 pt-5 border-t border-white/5 flex gap-3">
                <button className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20">
                  Start Consultation
                </button>
                <button className="px-5 py-3 bg-white/5 hover:bg-white/10 text-white text-sm font-bold rounded-xl transition-all border border-white/10">
                  Records
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="py-12 border-2 border-dashed border-white/5 rounded-3xl flex items-center justify-center">
              <p className="text-slate-500 text-sm italic">No upcoming appointments.</p>
            </div>
          )}
        </div>

          {/* Quick Action Side Panel */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2rem] p-8 h-fit shadow-xl shadow-indigo-900/40 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-bold text-xl text-white mb-3">Health Monitor</h3>
              <p className="text-indigo-100/70 text-sm mb-8 leading-relaxed">Check real-time alerts for patients with critical conditions or pending lab results.</p>
              <button className="w-full py-4 bg-white text-indigo-700 font-black text-xs uppercase tracking-widest rounded-xl shadow-lg hover:bg-slate-50 transition-all group relative overflow-hidden">
                <span className="relative z-10 transition-transform duration-300 group-hover:-translate-y-full group-hover:opacity-0 flex items-center justify-center">
                  Check Alerts
                </span>
                <span className="absolute inset-0 flex items-center justify-center translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 text-indigo-700 font-black text-xs uppercase tracking-widest">
                  Checking
                </span>
              </button>
            </div>
            {/* Visual Decoration */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
          </div>
        </div>
      </main>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white/5 border border-white/10 p-7 rounded-[2rem]">
    <div className={`${color} w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-5 text-white shadow-lg`}>
      {icon}
    </div>
    <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">{title}</p>
    <h3 className="text-4xl font-bold text-white">{value}</h3>
  </div>
);

export default DoctorDashboard;