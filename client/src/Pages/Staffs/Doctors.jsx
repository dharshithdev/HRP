import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../Contexts/AuthFile';
import StaffSidebar from '../../Components/StaffSidebar';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
   FiPhone, FiMail, FiClock, FiX, FiCheckCircle, FiChevronRight, FiActivity, FiBriefcase 
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
    setLoading(true);
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
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#060910] text-white">
      <StaffSidebar logout={logout} />

      <main className="flex-1 flex overflow-hidden h-screen">
        {/* LEFT SIDE: Doctor List */}
        <div className={`transition-all duration-500 p-6 lg:p-10 overflow-y-auto custom-scrollbar ${selectedDoctor ? 'hidden lg:block lg:w-[40%]' : 'w-full'}`}>
          <header className="mb-10">
            <div className="flex items-center gap-2 mb-2">
              <FiBriefcase className="text-indigo-500 text-xs" />
              <h2 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">Personnel Management</h2>
            </div>
            <h1 className="text-4xl font-black italic tracking-tighter">Medical Staff</h1>
            <p className="text-slate-500 text-sm mt-2">Verified practitioners and active schedules</p>
          </header>

          <div className="grid gap-4">
            {loading ? (
              [1, 2, 3, 4].map(i => <div key={i} className="h-24 w-full bg-white/5 animate-pulse rounded-[2rem]" />)
            ) : (
              doctors.map((doc) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={doc._id}
                  onClick={() => setSelectedDoctor(doc)}
                  className={`p-6 rounded-[2.2rem] cursor-pointer border transition-all flex items-center justify-between group ${
                    selectedDoctor?._id === doc._id 
                    ? 'bg-indigo-600 border-indigo-400 shadow-xl shadow-indigo-900/40' 
                    : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/[0.08]'
                  }`}
                >
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl transition-colors shadow-inner ${
                      selectedDoctor?._id === doc._id ? 'bg-white text-indigo-600' : 'bg-indigo-600/20 text-indigo-400'
                    }`}>
                      {doc.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg leading-none mb-2">{doc.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${selectedDoctor?._id === doc._id ? 'bg-indigo-200' : 'bg-emerald-500'}`}></span>
                        <p className={`text-[10px] uppercase font-black tracking-[0.1em] ${
                          selectedDoctor?._id === doc._id ? 'text-indigo-100' : 'text-slate-500'
                        }`}>
                          {doc.specialization}
                        </p>
                      </div>
                    </div>
                  </div>
                  <FiChevronRight className={`text-xl transition-all ${selectedDoctor?._id === doc._id ? 'rotate-90 text-white' : 'text-slate-600 group-hover:translate-x-1 group-hover:text-white'}`} />
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT SIDE: Detail Panel */}
        <AnimatePresence mode="wait">
          {selectedDoctor && (
            <motion.div 
              key={selectedDoctor._id}
              initial={{ x: '100%', opacity: 0 }} 
              animate={{ x: 0, opacity: 1 }} 
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full lg:w-[60%] bg-[#0b0f1a] border-l border-white/10 p-6 lg:p-14 overflow-y-auto relative z-30"
            >
              <button 
                onClick={() => setSelectedDoctor(null)} 
                className="absolute top-6 lg:top-10 right-6 lg:right-10 text-slate-500 hover:text-white bg-white/5 p-3 rounded-2xl hover:bg-white/10 transition-all"
              >
                <FiX size={24} />
              </button>

              <div className="mb-14">
                <div className="flex items-center gap-2 mb-4">
                  <FiActivity className="text-indigo-500 text-xs" />
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em]">Active Practitioner File</span>
                </div>
                <h2 className="text-4xl lg:text-6xl font-black italic tracking-tighter uppercase leading-tight">{selectedDoctor.name}</h2>
                <div className="mt-6 flex flex-wrap gap-2">
                    <span className="px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-indigo-600 text-white shadow-lg shadow-indigo-900/20">
                    {selectedDoctor.specialization}
                    </span>
                    <span className="px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white/5 text-slate-400 border border-white/5">
                    ID: {selectedDoctor._id.slice(-8)}
                    </span>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mb-12">
                <DetailItem icon={<FiPhone />} label="Direct Line" value={selectedDoctor.phone || "No Phone Registered"} />
                <DetailItem icon={<FiMail />} label="Secure Email" value={selectedDoctor.userId?.email || "N/A"} />
              </div>

              {/* Availability Schedule */}
              <div className="bg-white/5 rounded-[2.5rem] p-6 lg:p-8 border border-white/5">
                <h3 className="text-xl font-black italic flex items-center gap-3 uppercase mb-8">
                  <FiClock className="text-indigo-500" /> Duty Roster
                </h3>
                
                <div className="space-y-3">
                  {selectedDoctor.availability && selectedDoctor.availability.length > 0 ? (
                    selectedDoctor.availability.map((sched, idx) => (
                      <div key={idx} className="bg-black/20 p-5 rounded-2xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-indigo-500/30 transition-all group">
                        <span className="font-black text-white uppercase tracking-widest text-xs flex items-center gap-2">
                           <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                           {sched.day}
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {sched.slots.map((slot, sIdx) => (
                            <span key={sIdx} className="bg-indigo-600/10 text-indigo-400 px-3 py-1.5 rounded-lg text-[10px] font-black border border-indigo-500/20 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                              {slot}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-10 text-center border-2 border-dashed border-white/5 rounded-3xl">
                        <FiClock className="mx-auto text-slate-700 mb-2" size={32} />
                        <p className="text-slate-600 font-bold text-xs uppercase tracking-widest">Schedule not published</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-start gap-4">
                <FiCheckCircle className="text-emerald-500 mt-1 flex-shrink-0" />
                <div>
                    <p className="text-xs font-black text-emerald-500 uppercase tracking-widest">Verified Practitioner</p>
                    <p className="text-[11px] text-slate-500 mt-1">This doctor is authorized to access HRP and manage patient records across all connected departments.</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

const DetailItem = ({ icon, label, value }) => (
  <div className="bg-white/5 p-6 lg:p-8 rounded-[2rem] border border-white/5 hover:bg-white/[0.08] transition-all group">
    <div className="flex items-center gap-3 text-indigo-500 mb-3 text-[10px] font-black uppercase tracking-[0.2em]">
      {icon} {label}
    </div>
    <p className="text-lg font-bold group-hover:text-indigo-400 transition-colors truncate">{value}</p>
  </div>
);

export default DoctorRecords;