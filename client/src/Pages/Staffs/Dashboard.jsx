import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../Contexts/AuthFile';
import StaffSidebar from '../../Components/StaffSidebar';
import axios from 'axios';
import { 
  FiUsers, FiCalendar, FiClock, FiCheckCircle, FiActivity, FiArrowRight 
} from 'react-icons/fi';
import { motion } from 'framer-motion';

const StaffDashboard = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [dateTime, setDateTime] = useState(new Date());
  const [stats, setStats] = useState({
    todayPatients: 0,
    totalAppointments: 0,
    availableDoctors: "0/0"
  });
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    
    // Initial data fetch
    const loadDashboardData = async () => {
      setLoading(true);
      await Promise.all([fetchDashboardData(), fetchQueue()]);
      setLoading(false);
    };

    loadDashboardData();
    return () => clearInterval(timer);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/staff/dashboard-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching staff stats", err);
    }
  };

  const fetchQueue = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/staff/dashboard/queue`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setQueue(res.data);
    } catch (err) {
      console.error("Queue fetch error", err);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#060910] text-white">
      <StaffSidebar logout={logout} />

      <main className="flex-1 p-5 lg:p-10 overflow-y-auto">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
              <h2 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">Hospital Resource Planning</h2>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black italic tracking-tighter">Command Center</h1>
          </div>
          
          <div className="w-full md:w-auto text-left md:text-right bg-white/5 p-5 lg:p-6 rounded-[2rem] border border-white/5 backdrop-blur-md shadow-2xl">
            <div className="flex items-center gap-3 text-indigo-400 font-bold mb-1 md:justify-end text-xs uppercase tracking-widest">
              <FiCalendar /> {dateTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
            <div className="flex items-center gap-3 text-3xl font-black tracking-tighter">
              <FiClock className="text-indigo-600" /> {dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-10">
          <StatCard 
            label="Today's Patients" 
            value={stats.todayPatients} 
            icon={<FiUsers />} 
            color="text-blue-400" 
            bg="bg-blue-400/10"
          />
          <StatCard 
            label="Appointments" 
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

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Quick Actions Panel */}
          <div className="bg-white/5 rounded-[2.5rem] p-6 lg:p-8 border border-white/5">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 uppercase tracking-tighter italic">
              Quick Operations
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ActionButton 
                onClick={() => navigate('/staff/new-patient')} 
                label="Register Patient" 
                sub="New Entry" 
              />
              <ActionButton 
                onClick={() => navigate('/staff/new-appointment')} 
                label="Schedule Visit" 
                sub="Book Slot" 
              />
              <ActionButton 
                onClick={() => navigate('/staff/alert')} 
                label="Emergency Alert" 
                sub="Broadcast" 
                color="bg-red-500/10 text-red-500 border-red-500/20" 
              />
              <ActionButton 
                onClick={() => navigate('/staff/billing')} 
                label="Generate Bill" 
                sub="Invoicing" 
              />
            </div>
          </div>

          {/* Live Queue Container */}
          <div className="bg-white/5 rounded-[2.5rem] p-6 lg:p-8 border border-white/10 flex flex-col min-h-[400px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2 uppercase tracking-tighter italic">
                <FiClock className="text-indigo-500" /> Live Queue
              </h3>
              <span className="flex items-center gap-1.5 text-[9px] bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-lg font-black uppercase tracking-widest border border-emerald-500/20">
                Live Feed
              </span>
            </div>
            
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
              {queue.length > 0 ? (
                queue.map((item, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={item._id} 
                    className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5 hover:border-indigo-500/40 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white text-xs">
                        {item.patientId?.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold group-hover:text-indigo-400 transition-colors">{item.patientId?.name}</p>
                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">
                          Attending: Dr. {item.doctorId?.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-mono font-black text-indigo-400 bg-indigo-400/10 px-2 py-1 rounded-lg">{item.timeSlot}</p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-20 py-10">
                  <FiCheckCircle size={48} className="mb-3" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em]">All Patients Cleared</p>
                </div>
              )}
            </div>
            
            <button 
              onClick={() => navigate('/staff/all-appointments')}
              className="w-full mt-6 py-4 bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 group"
            >
              Master Schedule <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

const StatCard = ({ label, value, icon, color, bg }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white/5 p-6 lg:p-8 rounded-[2rem] border border-white/5 hover:bg-white/[0.07] transition-all group relative overflow-hidden"
  >
    <div className={`w-12 h-12 lg:w-14 lg:h-14 ${bg} ${color} rounded-2xl flex items-center justify-center text-xl lg:text-2xl mb-6 shadow-inner`}>
      {icon}
    </div>
    <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest">{label}</p>
    <p className="text-4xl lg:text-5xl font-black mt-2 tracking-tighter">{value}</p>
  </motion.div>
);

const ActionButton = ({ label, sub, onClick, color = "bg-white/5 text-white border-white/5" }) => (
  <button 
    onClick={onClick} 
    className={`${color} p-5 lg:p-6 rounded-2xl text-left hover:bg-indigo-600 hover:text-white transition-all border group relative overflow-hidden`}
  >
    <p className="font-black text-sm uppercase tracking-tighter italic">{label}</p>
    <p className="text-[9px] opacity-60 uppercase font-black tracking-widest mt-1">{sub}</p>
    <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <FiArrowRight />
    </div>
  </button>
);

export default StaffDashboard;