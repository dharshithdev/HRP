import React, { useContext, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AuthContext } from '../../Contexts/AuthFile';
import axios from 'axios';
import { 
  FiCalendar, FiUsers, FiClipboard, FiActivity, 
  FiClock, FiChevronRight 
} from 'react-icons/fi';

const DoctorDashboard = () => {
  // 1. Get user and authLoading from your context
  const { user, loading: authLoading } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hardcoded stats for metrics we haven't built DB logic for yet
  const pendingReports = "05";
  const avgWaitTime = "15m";

  useEffect(() => {
    console.log("Dashboard Effect Check - User:", user);

    const fetchDoctorData = async () => {
      try {
        // Use user.id as seen in your console log
        console.log("Fetching for Doctor ID:", user.id);
        
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/appointments/doctor/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` } 
        });
        
        console.log("Successfully fetched appointments:", response.data);
        setAppointments(response.data);
      } catch (err) {
        console.error("Dashboard Fetch Error:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    // Only run when auth is finished and user exists
    if (!authLoading && user?.id) {
      fetchDoctorData();
    } else if (!authLoading && !user) {
      // If auth finished and no user, stop loading (Login redirect handled by App.js)
      setLoading(false);
    }
  }, [user, authLoading]);

  // Derived Calculations
  const totalAppointments = appointments.length;
  
  // NOTE: This will show 0 unless the appointmentDate in DB matches today's date
  const todaysPatients = appointments.filter(app => {
    if (!app.appointmentDate) return false;
    return new Date(app.appointmentDate).toDateString() === new Date().toDateString();
  }).length;

  // Loading UI
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#0b0f1a] flex flex-col items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
        <p className="text-slate-400 font-medium tracking-wide">Initializing Doctor Portal...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-white font-sans p-8">
      
      {/* Header Section */}
      <header className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Welcome back, Dr. {user?.name || 'User'}</h2>
          <p className="text-slate-400 mt-1">Here is your real-time clinic overview.</p>
        </div>
        <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-white">{user?.role}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center font-bold text-xl shadow-lg">
                {user?.name?.charAt(0) || 'D'}
            </div>
        </div>
      </header>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard title="Today's Patients" value={todaysPatients} icon={<FiUsers />} color="bg-blue-500" />
        <StatCard title="Total Appointments" value={totalAppointments} icon={<FiCalendar />} color="bg-purple-500" />
        <StatCard title="Pending Reports" value={pendingReports} icon={<FiClipboard />} color="bg-orange-500" />
        <StatCard title="Avg. Wait Time" value={avgWaitTime} icon={<FiClock />} color="bg-emerald-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Real Appointments Table */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-[2rem] p-8 backdrop-blur-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold">Upcoming Appointments</h3>
            <button className="text-indigo-400 text-sm font-semibold hover:text-indigo-300 transition-colors">View All Schedule</button>
          </div>
          
          <div className="space-y-4">
            {appointments.length > 0 ? appointments.slice(0, 6).map((app) => (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                key={app._id} 
                className="flex items-center justify-between p-5 bg-slate-900/40 rounded-2xl border border-white/5 hover:border-indigo-500/40 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-colors">
                    <FiUsers size={20} />
                  </div>
                  <div>
                    {/* patientId.name comes from the .populate() in your backend */}
                    <p className="font-bold text-slate-100">{app.patientId?.name || "Unregistered Patient"}</p>
                    <p className="text-xs text-slate-500 font-medium">
                        {new Date(app.appointmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-indigo-400">{app.timeSlot}</p>
                  <span className={`text-[10px] px-2 py-1 rounded-md font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20`}>
                    {app.status}
                  </span>
                </div>
              </motion.div>
            )) : (
              <div className="text-center py-16">
                <p className="text-slate-500 font-medium">No appointments currently scheduled.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Actions & Alerts */}
        <div className="space-y-8">
          {/* Quick Action Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2rem] p-8 shadow-xl shadow-indigo-900/20">
            <div className="relative z-10">
                <h3 className="font-bold text-xl mb-3">Quick Consult</h3>
                <p className="text-indigo-100/80 text-sm mb-8 leading-relaxed">Instantly access medical records, health history, and issue new digital prescriptions.</p>
                <button className="w-full py-4 bg-white text-indigo-700 font-black text-sm uppercase tracking-widest rounded-xl shadow-lg hover:bg-slate-50 hover:scale-[1.02] active:scale-95 transition-all">
                Start New Session
                </button>
            </div>
            {/* Background Decoration */}
            <div className="absolute top-[-20%] right-[-20%] w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
          </div>

          {/* Hardcoded Alerts */}
          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                Urgent Alerts
            </h3>
            <div className="space-y-6">
                <div className="flex gap-4 items-start group cursor-pointer">
                    <div className="mt-1.5 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                    <p className="text-sm text-slate-300 group-hover:text-white transition-colors">Lab results ready for <strong>Patient #12</strong>. Critical BP level detected.</p>
                </div>
                <div className="flex gap-4 items-start group cursor-pointer">
                    <div className="mt-1.5 w-2 h-2 rounded-full bg-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.5)]" />
                    <p className="text-sm text-slate-300 group-hover:text-white transition-colors">Emergency reschedule request for 11:30 AM slot.</p>
                </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// Reusable StatCard Component
const StatCard = ({ title, value, icon, color }) => (
  <motion.div 
    whileHover={{ y: -5 }} 
    className="bg-white/5 border border-white/10 p-7 rounded-[2rem] backdrop-blur-sm"
  >
    <div className={`${color} w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-5 shadow-lg text-white`}>
      {icon}
    </div>
    <p className="text-slate-500 text-xs font-black uppercase tracking-[0.15em] mb-1">{title}</p>
    <h3 className="text-4xl font-bold tracking-tighter">{value}</h3>
  </motion.div>
);

export default DoctorDashboard;