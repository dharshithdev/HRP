import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../Contexts/AuthFile';
import StaffSidebar from '../../Components/StaffSidebar';
import axios from 'axios';
import { 
  FiUsers, FiCalendar, FiClock, FiCheckCircle, FiArrowRight, FiActivity 
} from 'react-icons/fi';

const StaffDashboard = () => {
  const { logout } = useContext(AuthContext);
  const [dateTime, setDateTime] = useState(new Date());
  const [stats, setStats] = useState({
    todayPatients: 0,
    totalAppointments: 0,
    availableDoctors: 0
  });

  useEffect(() => {
    // Clock Timer
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    fetchDashboardData();
    return () => clearInterval(timer);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      // Replace with your actual endpoints
      const res = await axios.get('http://localhost:5000/api/staff/dashboard-stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching staff stats", err);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#060910] text-white">
      <StaffSidebar logout={logout} />

      <main className="flex-1 p-10 overflow-y-auto">
        {/* Header Section */}
        <header className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-xs font-black text-indigo-500 uppercase tracking-[0.3em] mb-2">Hospital Resource Planning</h2>
            <h1 className="text-5xl font-black italic">Command Center</h1>
          </div>
          
          <div className="text-right bg-white/5 p-6 rounded-[2rem] border border-white/5 backdrop-blur-md">
            <div className="flex items-center gap-3 text-indigo-400 font-bold mb-1 justify-end">
              <FiCalendar /> {dateTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
            <div className="flex items-center gap-3 text-3xl font-black tracking-tighter">
              <FiClock className="text-indigo-600" /> {dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-8 mb-12">
          <StatCard 
            label="Today's Patients" 
            value={stats.todayPatients} 
            icon={<FiUsers />} 
            color="text-blue-400" 
            bg="bg-blue-400/10"
          />
          <StatCard 
            label="Total Appointments" 
            value={stats.totalAppointments} 
            icon={<FiCheckCircle />} 
            color="text-emerald-400" 
            bg="bg-emerald-400/10"
          />
          <StatCard 
            label="Doctors On-Duty" 
            value={stats.availableDoctors} 
            icon={<FiActivity />} 
            color="text-orange-400" 
            bg="bg-orange-400/10"
          />
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Quick Actions Panel */}
          <div className="bg-white/5 rounded-[2.5rem] p-8 border border-white/5">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              Quick Operations
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <ActionButton label="Register New Patient" sub="Create profile" />
              <ActionButton label="Check-in Patient" sub="Mark arrival" />
              <ActionButton label="Emergency Alert" sub="Notify ER" color="bg-red-500/20 text-red-400" />
              <ActionButton label="Generate Bill" sub="Finalize visit" />
            </div>
          </div>

          {/* Pending Tasks / Notifications */}
          <div className="bg-indigo-600 rounded-[2.5rem] p-8 shadow-2xl shadow-indigo-900/30 relative overflow-hidden">
             <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2">System Notice</h3>
                <p className="text-indigo-100/70 mb-6">3 doctors have not updated their availability for next week.</p>
                <button className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-black flex items-center gap-2 hover:scale-105 transition-all">
                  Send Reminders <FiArrowRight />
                </button>
             </div>
             <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          </div>
        </div>
      </main>
    </div>
  );
};

const StatCard = ({ label, value, icon, color, bg }) => (
  <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 hover:border-white/20 transition-all group">
    <div className={`w-14 h-14 ${bg} ${color} rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">{label}</p>
    <p className="text-5xl font-black mt-2 tracking-tighter">{value}</p>
  </div>
);

const ActionButton = ({ label, sub, color = "bg-white/5 text-white" }) => (
  <button className={`${color} p-6 rounded-3xl text-left hover:scale-[1.02] transition-all border border-white/5`}>
    <p className="font-bold">{label}</p>
    <p className="text-[10px] opacity-50 uppercase font-black tracking-widest mt-1">{sub}</p>
  </button>
);

export default StaffDashboard;