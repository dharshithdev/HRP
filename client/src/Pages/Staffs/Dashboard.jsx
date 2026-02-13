import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../Contexts/AuthFile';
import StaffSidebar from '../../Components/StaffSidebar';
import axios from 'axios';
import { 
  FiUsers, FiCalendar, FiClock, FiCheckCircle, FiArrowRight, FiActivity 
} from 'react-icons/fi';

const StaffDashboard = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [dateTime, setDateTime] = useState(new Date());
  const [stats, setStats] = useState({
    todayPatients: 0,
    totalAppointments: 0,
    availableDoctors: "0/0" // Updated to handle the string format we discussed
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
      const res = await axios.get('http://localhost:5000/api/staff/dashboard-stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching staff stats", err);
    }
  };

  const [queue, setQueue] = useState([]);

// 2. Add fetch function inside StaffDashboard
const fetchQueue = async () => {
  try {
    const res = await axios.get('http://localhost:5000/api/staff/dashboard/queue', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    setQueue(res.data);
  } catch (err) {
    console.error("Queue fetch error", err);
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
              <ActionButton 
                onClick={() => navigate('/staff/new-patient')} 
                label="Register New Patient" 
                sub="Create profile" 
              />
              <ActionButton 
                onClick={() => navigate('/staff/new-appointment')} 
                label="New Appointment" 
                sub="Mark arrival" 
              />
              <ActionButton 
                onClick={() => navigate('/staff/alert')} 
                label="Emergency Alert" 
                sub="Notify ER" 
                color="bg-red-500/20 text-red-400" 
              />
              <ActionButton 
                onClick={() => navigate('/staff/billing')} 
                label="Generate Bill" 
                sub="Finalize visit" 
              />
            </div>
          </div>

          {/* Pending Tasks / Notifications */}
          <div className="bg-white/5 rounded-[2.5rem] p-8 border border-white/10 relative overflow-hidden flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FiClock className="text-indigo-500" /> Live Queue
              </h3>
              <span className="flex items-center gap-1.5 text-[10px] bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full font-black uppercase tracking-widest">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                Today
              </span>
            </div>
            
            <div className="space-y-4 flex-1">
              {queue.length > 0 ? (
                queue.map((item) => (
                  <div key={item._id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center font-bold text-indigo-400 text-sm">
                        {item.patientId?.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{item.patientId?.name}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-wider">
                          Dr. {item.doctorId?.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-mono font-bold text-indigo-400">{item.timeSlot}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-30 py-10">
                  <FiCheckCircle size={40} className="mb-2" />
                  <p className="text-xs font-bold uppercase tracking-widest">Queue Clear</p>
                </div>
              )}
            </div>
            
            <button 
              onClick={() => navigate('/staff/all-appointments')}
              className="w-full mt-6 py-4 bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            >
              View Full Schedule
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

// Helper Components
const StatCard = ({ label, value, icon, color, bg }) => (
  <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 hover:border-white/20 transition-all group">
    <div className={`w-14 h-14 ${bg} ${color} rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">{label}</p>
    <p className="text-5xl font-black mt-2 tracking-tighter">{value}</p>
  </div>
);

const ActionButton = ({ label, sub, onClick, color = "bg-white/5 text-white" }) => (
  <button 
    onClick={onClick} 
    className={`${color} p-6 rounded-3xl text-left hover:scale-[1.02] transition-all border border-white/5 w-full`}
  >
    <p className="font-bold">{label}</p>
    <p className="text-[10px] opacity-50 uppercase font-black tracking-widest mt-1">{sub}</p>
  </button>
);

export default StaffDashboard;