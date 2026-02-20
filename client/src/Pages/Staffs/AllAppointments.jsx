import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../Contexts/AuthFile';
import StaffSidebar from '../../Components/StaffSidebar';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiCalendar, FiClock, FiUser, FiActivity, FiX, FiCheckCircle, FiSearch, FiFilter 
} from 'react-icons/fi';

const AllAppointments = () => {
  const { logout } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAppointments(); }, []);

  // Handle local filtering for search
  useEffect(() => {
    const filtered = appointments.filter(app => 
      app.patientId?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.doctorId?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredApps(filtered);
  }, [searchQuery, appointments]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/staff/appointments`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAppointments(res.data);
      setFilteredApps(res.data);
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await axios.patch(`${process.env.REACT_APP_API_URL}/api/staff/appointments/${id}`, { status }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      // Refresh list and clear selection
      fetchAppointments();
      setSelectedApp(null);
    } catch (err) { 
      alert("Update failed"); 
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#060910] text-white">
      <StaffSidebar logout={logout} />
      
      <main className="flex-1 flex overflow-hidden h-screen">
        
        {/* LEFT SIDE: LIST */}
        <div className={`p-6 lg:p-10 overflow-y-auto transition-all duration-500 custom-scrollbar ${selectedApp ? 'hidden lg:block lg:w-[40%]' : 'w-full'}`}>
          <header className="mb-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
              <h2 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">Master Schedule</h2>
            </div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase">Appointments</h1>
            
            {/* Search and Filters */}
            <div className="flex gap-3 mt-8">
              <div className="relative flex-1 group">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input 
                  type="text"
                  placeholder="Find patient or doctor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-indigo-500/50 transition-all text-sm"
                />
              </div>
              <button className="bg-white/5 border border-white/10 p-4 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                <FiFilter />
              </button>
            </div>
          </header>

          <div className="space-y-3">
            {loading ? (
              [1, 2, 3, 4].map(i => <div key={i} className="h-24 w-full bg-white/5 animate-pulse rounded-[2rem]" />)
            ) : filteredApps.length > 0 ? (
              filteredApps.map(app => (
                <motion.div 
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key={app._id} 
                  onClick={() => setSelectedApp(app)}
                  className={`p-5 rounded-[2.2rem] border cursor-pointer flex justify-between items-center transition-all group ${
                    selectedApp?._id === app._id ? 'bg-indigo-600 border-indigo-400 shadow-xl shadow-indigo-900/40' : 'bg-white/5 border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`px-3 py-2 rounded-xl text-[10px] font-black font-mono transition-colors ${
                       selectedApp?._id === app._id ? 'bg-white text-indigo-600' : 'bg-black/20 text-indigo-400'
                    }`}>
                      {app.timeSlot}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm leading-tight">{app.patientId?.name}</h4>
                      <p className={`text-[9px] uppercase font-black tracking-widest mt-1 ${
                        selectedApp?._id === app._id ? 'text-indigo-200' : 'text-slate-500'
                      }`}>DR. {app.doctorId?.name}</p>
                    </div>
                  </div>
                  <StatusTag status={app.status} isSelected={selectedApp?._id === app._id} />
                </motion.div>
              ))
            ) : (
              <div className="text-center py-20 opacity-20">
                <FiCalendar size={48} className="mx-auto mb-4" />
                <p className="font-black uppercase tracking-[0.2em] text-xs">No Appointments Found</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDE: DETAILS */}
        <AnimatePresence>
          {selectedApp && (
            <motion.div 
              initial={{ x: '100%' }} 
              animate={{ x: 0 }} 
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full lg:w-[60%] bg-[#0b0f1a] border-l border-white/10 p-6 lg:p-14 relative overflow-y-auto z-30"
            >
              <button 
                onClick={() => setSelectedApp(null)} 
                className="absolute top-6 lg:top-10 right-6 lg:right-10 text-slate-500 hover:text-white p-3 bg-white/5 rounded-2xl"
              >
                <FiX size={24}/>
              </button>
              
              <div className="mb-12">
                <div className="flex items-center gap-2 mb-4">
                   <FiActivity className="text-indigo-500" />
                   <span className="text-indigo-500 font-black tracking-[0.4em] text-[10px] uppercase">Clinic Visit Metadata</span>
                </div>
                <h2 className="text-4xl lg:text-6xl font-black italic tracking-tighter uppercase leading-tight">
                  {selectedApp.patientId?.name}
                </h2>
                <div className="mt-4">
                   <StatusTag status={selectedApp.status} large />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mb-12">
                <InfoCard icon={<FiCalendar/>} label="Scheduled Date" value={new Date(selectedApp.appointmentDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} />
                <InfoCard icon={<FiClock/>} label="Time Slot" value={selectedApp.timeSlot} />
                <InfoCard icon={<FiActivity/>} label="Assigned Doctor" value={`Dr. ${selectedApp.doctorId?.name}`} />
                <InfoCard icon={<FiUser/>} label="Contact" value={selectedApp.patientId?.contact} />
              </div>

              <div className="bg-white/5 p-8 lg:p-10 rounded-[3rem] border border-white/5 relative overflow-hidden">
                <div className="relative z-10">
                    <h4 className="font-black italic uppercase text-lg mb-2">Management Actions</h4>
                    <p className="text-slate-500 text-xs mb-8">Update the status of this visit for real-time queue tracking.</p>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                        onClick={() => handleStatusUpdate(selectedApp._id, 'Completed')} 
                        className="flex-1 bg-indigo-600 py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-900/20 active:scale-95"
                    >
                        <FiCheckCircle size={18}/> Check-out Patient
                    </button>
                    <button 
                        onClick={() => handleStatusUpdate(selectedApp._id, 'Cancelled')} 
                        className="flex-1 bg-red-600/10 text-red-500 border border-red-500/20 py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] hover:bg-red-600 hover:text-white transition-all active:scale-95"
                    >
                        Void Appointment
                    </button>
                    </div>
                </div>
                {/* Decorative Background Icon */}
                <FiActivity className="absolute -bottom-10 -right-10 text-white/[0.02] scale-[10]" />
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
  <div className="bg-white/5 p-6 lg:p-8 rounded-[2rem] border border-white/5 hover:bg-white/[0.08] transition-all">
    <div className="flex items-center gap-2 text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-3">
      {icon} {label}
    </div>
    <p className="text-lg font-bold tracking-tight">{value}</p>
  </div>
);

const StatusTag = ({ status, isSelected, large }) => {
  const styles = {
    Confirmed: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    Completed: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    Cancelled: "text-red-400 bg-red-400/10 border-red-400/20"
  };

  const selectedStyles = "text-white bg-white/20 border-white/40";
  
  return (
    <span className={`
      ${large ? 'px-5 py-2 text-[11px]' : 'px-3 py-1 text-[9px]'} 
      rounded-xl font-black uppercase border transition-colors
      ${isSelected ? selectedStyles : styles[status]}
    `}>
      {status}
    </span>
  );
}

export default AllAppointments;