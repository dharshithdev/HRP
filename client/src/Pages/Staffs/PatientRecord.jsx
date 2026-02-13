import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../Contexts/AuthFile';
import StaffSidebar from '../../Components/StaffSidebar';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSearch, FiUser, FiCalendar, FiPhone, FiInfo, FiX, FiClock 
} from 'react-icons/fi';

const PatientRecords = () => {
  const { logout } = useContext(AuthContext);
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [history, setHistory] = useState({ patient: null, appointments: [] });
  const [loading, setLoading] = useState(false);

  // Fetch patients on load or search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchPatients();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/staff/patients/search?query=${searchQuery}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPatients(res.data);
    } catch (err) {
      console.error("Search failed", err);
    }
  };

  const handlePatientClick = async (patientId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/staff/patients/history/${patientId}`, { 
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
    <div className="flex min-h-screen bg-[#060910] text-white">
      <StaffSidebar logout={logout} />

      <main className="flex-1 flex overflow-hidden h-screen">
        {/* LEFT SIDE: List Section */}
        <div className={`transition-all duration-500 p-8 overflow-y-auto custom-scrollbar ${selectedPatient ? 'w-2/5' : 'w-full'}`}>
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-4xl font-black italic">Patient Registry</h2>
            <div className="relative w-64">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search name or contact..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-3">
            {patients.map((p) => (
              <motion.div 
                layout
                key={p._id}
                onClick={() => handlePatientClick(p._id)}
                className={`p-5 rounded-[2rem] cursor-pointer border transition-all flex items-center justify-between ${selectedPatient === p._id ? 'bg-indigo-600 border-indigo-400' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center font-bold text-indigo-400">
                    {p.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-lg">{p.name}</p>
                    <p className="text-xs text-slate-400">Registered: {new Date(p.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest">{p.bloodGroup || 'N/A'}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE: Detail Panel */}
        <AnimatePresence>
          {selectedPatient && history.patient && (
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              className="w-3/5 bg-[#0b0f1a] border-l border-white/10 p-10 overflow-y-auto relative"
            >
              <button 
                onClick={() => setSelectedPatient(null)} 
                className="absolute top-10 right-10 text-slate-500 hover:text-white transition-colors"
              >
                <FiX size={28} />
              </button>

              <div className="mb-12">
                <p className="text-xs font-black text-indigo-500 uppercase tracking-[0.3em] mb-2">Detailed File</p>
                <h2 className="text-5xl font-black italic">{history.patient.name}</h2>
              </div>

              {/* Bio Grid */}
              <div className="grid grid-cols-2 gap-4 mb-10">
                <DetailCard icon={<FiUser />} label="Age / Gender" value={`${history.patient.age || 'N/A'} • ${history.patient.gender}`} />
                <DetailCard icon={<FiPhone />} label="Contact Number" value={history.patient.contact} />
              </div>

              {/* Appointment History */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <FiCalendar className="text-indigo-500" /> Appointment History
                </h3>
                
                {history.appointments.length > 0 ? (
                  <div className="space-y-4">
                    {history.appointments.map((app) => (
                      <div key={app._id} className="bg-white/5 p-6 rounded-[2rem] border border-white/5 flex justify-between items-center">
                        <div>
                          <p className="font-bold text-indigo-300">{app.doctorId?.name}</p>
                          <p className="text-xs text-slate-500">{app.doctorId?.specialization}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-sm">{new Date(app.appointmentDate).toLocaleDateString()}</p>
                          <p className="text-xs text-slate-500">{app.timeSlot}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-10 border-2 border-dashed border-white/5 rounded-[2rem] text-center text-slate-600 font-bold">
                    No previous appointments recorded
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

const DetailCard = ({ icon, label, value }) => (
  <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5">
    <div className="flex items-center gap-3 text-indigo-400 mb-2 font-bold text-xs uppercase tracking-widest">
      {icon} {label}
    </div>
    <p className="text-lg font-bold">{value}</p>
  </div>
);

export default PatientRecords;