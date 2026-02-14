import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../Contexts/AuthFile';
import StaffSidebar from '../../Components/StaffSidebar';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
   FiPhone, FiMail, FiClock, FiX, FiCheckCircle, FiChevronRight 
} from 'react-icons/fi';

const DoctorRecords = () => {
  const { logout } = useContext(AuthContext);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/staff/doctor-records`, { 
        headers: { Authorization: `Bearer ${token}` }
      });
      setDoctors(res.data);
    } catch (err) {
      console.error("Failed to fetch doctors", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#060910] text-white">
      <StaffSidebar logout={logout} />

      <main className="flex-1 flex overflow-hidden h-screen">
        {/* LEFT SIDE: Doctor List */}
        <div className={`transition-all duration-500 p-8 overflow-y-auto custom-scrollbar ${selectedDoctor ? 'w-2/5' : 'w-full'}`}>
          <header className="mb-10">
            <h2 className="text-4xl font-black italic">Medical Staff</h2>
            <p className="text-slate-500 mt-2">Manage doctor profiles and availability</p>
          </header>

          <div className="grid gap-4">
            {doctors.map((doc) => (
              <motion.div 
                layout
                key={doc._id}
                onClick={() => setSelectedDoctor(doc)}
                className={`p-6 rounded-[2rem] cursor-pointer border transition-all flex items-center justify-between group ${
                  selectedDoctor?._id === doc._id 
                  ? 'bg-indigo-600 border-indigo-400' 
                  : 'bg-white/5 border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl ${
                    selectedDoctor?._id === doc._id ? 'bg-white text-indigo-600' : 'bg-indigo-600/20 text-indigo-400'
                  }`}>
                    {doc.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{doc.name}</h3>
                    <p className={`text-xs uppercase font-black tracking-widest ${
                      selectedDoctor?._id === doc._id ? 'text-indigo-200' : 'text-slate-500'
                    }`}>
                      {doc.specialization}
                    </p>
                  </div>
                </div>
                <FiChevronRight className={`transition-transform ${selectedDoctor?._id === doc._id ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE: Detail Panel */}
        <AnimatePresence>
          {selectedDoctor && (
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              className="w-3/5 bg-[#0b0f1a] border-l border-white/10 p-12 overflow-y-auto relative"
            >
              <button 
                onClick={() => setSelectedDoctor(null)} 
                className="absolute top-10 right-10 text-slate-500 hover:text-white transition-colors"
              >
                <FiX size={28} />
              </button>

              <div className="mb-12">
                <span className="px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {selectedDoctor.specialization}
                </span>
                <h2 className="text-5xl font-black italic mt-4">{selectedDoctor.name}</h2>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-6 mb-12">
                <DetailItem icon={<FiPhone />} label="Phone" value={selectedDoctor.phone || "Not Set"} />
                <DetailItem icon={<FiMail />} label="Email" value={selectedDoctor.userId?.email || "No Email"} />
              </div>

              {/* Availability Schedule */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <FiClock className="text-indigo-500" /> Weekly Availability
                </h3>
                
                <div className="grid grid-cols-1 gap-3">
                  {selectedDoctor.availability && selectedDoctor.availability.length > 0 ? (
                    selectedDoctor.availability.map((sched, idx) => (
                      <div key={idx} className="bg-white/5 p-5 rounded-2xl border border-white/5 flex items-center justify-between">
                        <span className="font-black text-indigo-400 uppercase tracking-widest text-sm">{sched.day}</span>
                        <div className="flex gap-2">
                          {sched.slots.map((slot, sIdx) => (
                            <span key={sIdx} className="bg-black/40 px-3 py-1 rounded-lg text-xs font-bold border border-white/5">
                              {slot}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-600 italic">No schedule set for this doctor.</p>
                  )}
                </div>
              </div>

              <div className="mt-12 p-8 bg-indigo-600/10 border border-indigo-500/20 rounded-[2.5rem]">
                <h4 className="font-bold flex items-center gap-2 mb-2 text-indigo-400">
                  <FiCheckCircle /> Status Overview
                </h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  This doctor is currently active in the system. Appointments can be booked based on the slots provided above.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

const DetailItem = ({ icon, label, value }) => (
  <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5">
    <div className="flex items-center gap-3 text-indigo-400 mb-2 text-xs font-black uppercase tracking-widest">
      {icon} {label}
    </div>
    <p className="text-lg font-bold">{value}</p>
  </div>
);

export default DoctorRecords;