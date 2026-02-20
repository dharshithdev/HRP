import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../Contexts/AuthFile';
import StaffSidebar from '../../Components/StaffSidebar';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSearch, FiUser, FiCalendar, FiPhone, FiX, FiActivity, FiDroplet, FiUsers, FiClock
} from 'react-icons/fi';

const PatientRecords = () => {
  const { logout } = useContext(AuthContext);
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [history, setHistory] = useState({ patient: null, appointments: [] });
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchPatients();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const fetchPatients = async () => {
    setListLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/staff/patients/search?query=${searchQuery}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPatients(res.data);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setListLoading(false);
    }
  };

  const handlePatientClick = async (patientId) => {
    if (selectedPatient === patientId) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/staff/patients/history/${patientId}`, { 
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(res.data);
      setSelectedPatient(patientId);
    } catch (err) {
      console.error("Failed to fetch history", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#060910] text-white">
      <StaffSidebar logout={logout} />

      <main className="flex-1 flex overflow-hidden h-screen">
        {/* LEFT SIDE: List Section */}
        <div className={`transition-all duration-500 p-6 lg:p-10 overflow-y-auto custom-scrollbar ${selectedPatient ? 'hidden lg:block lg:w-[40%]' : 'w-full'}`}>
          <header className="mb-10">
            <h2 className="text-3xl lg:text-4xl font-black italic uppercase tracking-tighter">Patient Registry</h2>
            <p className="text-slate-500 text-sm mt-2">Manage and view historical medical records</p>
            
            <div className="relative mt-8 group">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search by name, ID or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-indigo-500/50 outline-none transition-all placeholder:text-slate-600 font-medium"
              />
            </div>
          </header>

          <div className="space-y-4">
            {listLoading ? (
              [1, 2, 3].map(i => <div key={i} className="h-24 w-full bg-white/5 animate-pulse rounded-[2rem]" />)
            ) : patients.length > 0 ? (
              patients.map((p) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={p._id}
                  onClick={() => handlePatientClick(p._id)}
                  className={`p-5 rounded-[2rem] cursor-pointer border transition-all flex items-center justify-between group ${selectedPatient === p._id ? 'bg-indigo-600 border-indigo-400 shadow-xl shadow-indigo-900/40' : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/[0.07]'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-colors ${selectedPatient === p._id ? 'bg-white text-indigo-600' : 'bg-slate-800 text-indigo-400'}`}>
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-lg leading-tight">{p.name}</p>
                      <p className={`text-[10px] uppercase font-black tracking-widest mt-1 ${selectedPatient === p._id ? 'text-indigo-100' : 'text-slate-500'}`}>ID: {p._id.slice(-6)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${selectedPatient === p._id ? 'bg-indigo-500 text-white' : 'bg-white/5 text-slate-400'}`}>
                      {p.bloodGroup || 'O+'}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-20 opacity-20">
                <FiUsers size={48} className="mx-auto mb-4" />
                <p className="font-black uppercase tracking-widest text-xs">No records found</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDE: Detail Panel */}
        <AnimatePresence>
          {selectedPatient && (
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full lg:w-[60%] bg-[#0b0f1a] border-l border-white/10 p-6 lg:p-12 overflow-y-auto relative z-20"
            >
              <button 
                onClick={() => setSelectedPatient(null)} 
                className="absolute top-6 lg:top-10 right-6 lg:right-10 text-slate-500 hover:text-white bg-white/5 hover:bg-white/10 p-3 rounded-2xl transition-all"
              >
                <FiX size={24} />
              </button>

              {loading ? (
                <div className="h-full flex flex-col items-center justify-center gap-4">
                  <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Synchronizing File...</p>
                </div>
              ) : history.patient && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <header className="mb-12">
                    <div className="flex items-center gap-2 mb-3">
                      <FiActivity className="text-indigo-500" />
                      <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">Patient Data Profile</span>
                    </div>
                    <h2 className="text-4xl lg:text-6xl font-black italic tracking-tighter uppercase">{history.patient.name}</h2>
                    <p className="text-slate-500 mt-4 font-medium">Last visit: {history.appointments[0] ? new Date(history.appointments[0].appointmentDate).toLocaleDateString() : 'Never'}</p>
                  </header>

                  {/* Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                    <DetailCard icon={<FiUser />} label="Age / Gender" value={`${history.patient.age || '32'} Years • ${history.patient.gender}`} />
                    <DetailCard icon={<FiPhone />} label="Primary Contact" value={history.patient.contact} />
                    <DetailCard icon={<FiDroplet />} label="Blood Group" value={history.patient.bloodGroup || 'O Positive'} />
                    <DetailCard icon={<FiClock />} label="Reg. Date" value={new Date(history.patient.createdAt).toLocaleDateString()} />
                  </div>

                  {/* History Section */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                        <h3 className="text-xl font-black italic flex items-center gap-3 uppercase">
                        <FiCalendar className="text-indigo-500" /> Clinical History
                        </h3>
                        <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-lg font-black">{history.appointments.length} Total</span>
                    </div>
                    
                    {history.appointments.length > 0 ? (
                      <div className="space-y-4">
                        {history.appointments.map((app) => (
                          <div key={app._id} className="bg-white/5 p-6 rounded-[2.5rem] border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-white/[0.08] transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-indigo-600/20 rounded-xl flex items-center justify-center text-indigo-400">
                                    <FiActivity size={18} />
                                </div>
                                <div>
                                    <p className="font-bold text-white text-lg leading-none">Dr. {app.doctorId?.name}</p>
                                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-2">{app.doctorId?.specialization || 'Clinical Checkup'}</p>
                                </div>
                            </div>
                            <div className="sm:text-right w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-white/5">
                              <p className="font-black text-sm tracking-tighter text-indigo-400">{new Date(app.appointmentDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{app.timeSlot}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-16 border-2 border-dashed border-white/5 rounded-[3rem] text-center">
                        <FiCalendar size={40} className="mx-auto text-slate-700 mb-4" />
                        <p className="text-slate-600 font-black uppercase text-xs tracking-[0.2em]">Archival Data Empty</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

const DetailCard = ({ icon, label, value }) => (
  <div className="bg-white/5 p-6 lg:p-8 rounded-[2rem] border border-white/5 hover:border-indigo-500/20 transition-all">
    <div className="flex items-center gap-3 text-indigo-500 mb-3 font-black text-[10px] uppercase tracking-[0.2em]">
      {icon} {label}
    </div>
    <p className="text-xl font-bold tracking-tight">{value}</p>
  </div>
);

export default PatientRecords;