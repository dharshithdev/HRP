import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../Contexts/AuthFile';
import Sidebar from '../../Components/DocSidebar';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSearch, FiShield, FiX, FiCheckCircle, FiFileText, FiArrowLeft, FiActivity 
} from 'react-icons/fi';

const Appointments = () => {
  const { user, logout } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Form States
  const [newAllergy, setNewAllergy] = useState("");
  const [newHistory, setNewHistory] = useState("");
  const [currentRecord, setCurrentRecord] = useState("");

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/appointments/doctor/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(response.data);
    } catch (err) {
      console.error("Error fetching appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, numericStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${process.env.REACT_APP_API_URL}/api/doctor/appointment-status/${id}/status`, 
        { status: numericStatus }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(numericStatus === 1 ? "Patient Admitted" : "Patient Discharged");
      await fetchAppointments();
      if(selectedApp) {
        const updatedSelected = { ...selectedApp };
        updatedSelected.patientId.state = !!numericStatus; 
        setSelectedApp(updatedSelected);
      }
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleSubmitClinicalNote = async () => {
    try {
      const token = localStorage.getItem('token');
      const patientId = selectedApp.patientId._id;

      if (!newHistory.trim() && !newAllergy.trim() && !currentRecord.trim()) {
          alert("Please enter some clinical data before submitting.");
          return;
      }

      const historyPayload = {
          diagnosis: newHistory,
          newAllergies: newAllergy ? [newAllergy] : [],
          treatmentPlan: ""
      };

      await axios.patch(
          `${process.env.REACT_APP_API_URL}/api/doctor/update-history/${patientId}/history`, 
          historyPayload, 
          { headers: { Authorization: `Bearer ${token}` } }
      );

      if (currentRecord.trim()) {
          await axios.post(
              `${process.env.REACT_APP_API_URL}/api/doctor/records/${selectedApp.patientId._id}`, 
              {
                  patientId: selectedApp.patientId._id,
                  doctorId: user.id,
                  record: currentRecord
              }, 
              { headers: { Authorization: `Bearer ${token}` } }
          );
      }

      alert("Patient records updated and synced!");
      setNewAllergy(""); 
      setNewHistory(""); 
      setCurrentRecord("");
      fetchAppointments(); 
    } catch (err) { 
        alert("Error saving records: " + (err.response?.data?.message || "Check server"));
    }
  };

  const filteredApps = appointments.filter(app => 
    app.patientId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="min-h-screen bg-[#0b0f1a] flex items-center justify-center text-indigo-400 italic font-black uppercase tracking-widest text-xs">Accessing Encrypted Records...</div>;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#0b0f1a] text-white">
      <Sidebar logout={logout} />

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden h-screen relative">
        
        {/* LEFT SIDE: List (Hidden on mobile when a patient is selected) */}
        <div className={`transition-all duration-500 overflow-y-auto p-5 sm:p-8 custom-scrollbar h-full 
          ${selectedApp ? 'hidden lg:block lg:w-2/5 border-r border-white/5' : 'w-full'}`}>
          
          <header className="mb-8">
            <h2 className="text-3xl font-black italic tracking-tighter uppercase">Clinical Schedule</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Daily Patient Queue</p>
          </header>

          <div className="relative mb-6">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search by name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 focus:border-indigo-500 outline-none w-full text-sm transition-all" 
            />
          </div>

          <div className="space-y-3">
            {filteredApps.map((app) => ( 
              <motion.div 
                layout
                key={app._id}
                onClick={() => setSelectedApp(app)}
                className={`p-5 rounded-[2rem] cursor-pointer border transition-all active:scale-[0.98] ${selectedApp?._id === app._id ? 'bg-indigo-600 border-indigo-400 shadow-xl shadow-indigo-600/20' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-slate-800 flex items-center justify-center font-black text-indigo-400 border border-white/5">
                      {app.patientId?.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-sm lg:text-base leading-tight">{app.patientId?.name}</p>
                      <p className="text-[10px] uppercase font-black tracking-widest opacity-50 mt-1">{app.timeSlot}</p>
                    </div>
                  </div>
                  <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-tighter ${app.patientId?.state ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {app.patientId?.state ? 'Admitted' : 'Outpatient'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE: Detail Panel (Overlay on mobile) */}
        <AnimatePresence>
          {selectedApp && (
            <motion.div 
              initial={{ x: '100%' }} 
              animate={{ x: 0 }} 
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed lg:static inset-0 lg:inset-auto lg:w-3/5 bg-[#0b0f1a] lg:bg-slate-900/40 backdrop-blur-xl border-l border-white/10 p-6 sm:p-8 lg:p-10 overflow-y-auto custom-scrollbar z-[70] lg:z-auto"
            >
              {/* Back / Close Navigation */}
              <div className="flex justify-between items-center mb-8">
                <button onClick={() => setSelectedApp(null)} className="flex items-center gap-2 text-indigo-400 font-black text-[10px] uppercase tracking-[0.2em] hover:text-white transition-colors">
                  <FiArrowLeft size={18}/> Back to List
                </button>
                <button onClick={() => setSelectedApp(null)} className="hidden lg:block text-slate-500 hover:text-white">
                  <FiX size={24} />
                </button>
              </div>

              <div className="mb-10">
                <div className="flex items-center gap-3">
                   <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.3em]">Patient Dossier</p>
                   {selectedApp.patientId?.state && <span className="text-[9px] bg-blue-600 text-white px-2 py-0.5 rounded-md font-black uppercase animate-pulse">In-Patient</span>}
                </div>
                <h2 className="text-3xl lg:text-4xl font-black italic mt-2 uppercase tracking-tighter">{selectedApp.patientId?.name}</h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10">
                <InfoChip label="Gender" value={selectedApp.patientId?.gender || "N/A"} />
                <InfoChip label="Blood" value={selectedApp.patientId?.bloodGroup || "O+"} />
                <InfoChip label="Age" value={selectedApp.patientId?.age || "24"} />
              </div>

              {/* Patient Management Controls */}
              <div className="mb-10 p-6 bg-white/5 border border-white/5 rounded-[2rem]">
                <p className="text-[10px] font-black uppercase tracking-widest mb-4 text-slate-500 flex items-center gap-2"><FiActivity className="text-indigo-500"/> Patient Management</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button onClick={() => handleStatusUpdate(selectedApp._id, 1)} className={`flex-1 py-4 rounded-2xl border font-black text-[10px] uppercase tracking-widest transition-all ${selectedApp.patientId?.state ? 'bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-600/30' : 'bg-blue-600/10 text-blue-400 border-blue-600/20 hover:bg-blue-600 hover:text-white'}`}>Admit Patient</button>
                  <button onClick={() => handleStatusUpdate(selectedApp._id, 0)} className={`flex-1 py-4 rounded-2xl border font-black text-[10px] uppercase tracking-widest transition-all ${!selectedApp.patientId?.state ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-600/30' : 'bg-emerald-600/10 text-emerald-400 border-emerald-600/20 hover:bg-emerald-600 hover:text-white'}`}>Discharge</button>
                </div>
              </div>

              {/* Clinical Input Fields */}
              <div className="space-y-6 mb-12">
                 <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5">
                    <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest mb-4 text-orange-400"><FiShield /> Current Allergies</h4>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {selectedApp.patientId?.allergies?.length > 0 ? selectedApp.patientId?.allergies?.map((al, i) => (
                            <span key={i} className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest">{al}</span>
                        )) : <p className="text-[10px] text-slate-600 italic">No allergies recorded</p>}
                    </div>
                    <input value={newAllergy} onChange={(e) => setNewAllergy(e.target.value)} placeholder="Add new allergy profile..." className="w-full bg-[#0b0f1a] border border-white/10 rounded-xl p-4 text-sm focus:border-orange-500 outline-none transition-all" />
                 </div>

                 <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5">
                    <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest mb-4 text-indigo-400"><FiFileText /> Medical History Log</h4>
                    <ul className="text-xs text-slate-400 space-y-3 mb-6 list-none italic">
                        {selectedApp.patientId?.medicalHistory?.map((h, i) => (
                          <li key={i} className="flex gap-2"><span className="text-indigo-500">•</span> {h}</li>
                        ))}
                    </ul>
                    <textarea value={newHistory} onChange={(e) => setNewHistory(e.target.value)} placeholder="Append new clinical history..." className="w-full bg-[#0b0f1a] border border-white/10 rounded-xl p-4 text-sm focus:border-indigo-500 outline-none h-24 transition-all" />
                 </div>
              </div>

              {/* Note Entry */}
              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-[2.5rem] shadow-2xl shadow-indigo-900/40 mb-10">
                <h4 className="font-black text-xl mb-1 text-white uppercase italic tracking-tighter">Clinical Observation</h4>
                <p className="text-indigo-100/60 text-[10px] mb-6 uppercase tracking-widest font-black">Finalize Visit & Sync Profile</p>
                <textarea 
                  value={currentRecord}
                  onChange={(e) => setCurrentRecord(e.target.value)}
                  placeholder="Record symptoms, observations, and treatment plan..." 
                  className="w-full bg-black/20 border border-white/20 rounded-2xl p-4 text-white placeholder:text-white/40 focus:bg-black/30 outline-none min-h-[160px] mb-6 transition-all text-sm"
                />
                <button 
                  onClick={handleSubmitClinicalNote}
                  className="w-full py-4 bg-white text-indigo-600 font-black rounded-2xl shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 active:scale-95 uppercase text-xs tracking-widest"
                >
                  <FiCheckCircle /> Commit & Sync Record
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

const InfoChip = ({ label, value }) => (
  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-center group hover:bg-white/10 transition-all">
    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{label}</p>
    <p className="text-xs lg:text-sm font-bold mt-1 text-slate-200">{value}</p>
  </div>
);

export default Appointments;