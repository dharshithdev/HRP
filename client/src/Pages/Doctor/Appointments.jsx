import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../Contexts/AuthFile';
import Sidebar from '../../Components/DocSidebar';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSearch, FiShield, FiX, FiCheckCircle, FiFileText 
} from 'react-icons/fi';

const Appointments = () => {
  const { user, logout } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Form States for the detail panel
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

  // 1. Update Patient State via Appointment Bridge
  const handleStatusUpdate = async (id, numericStatus) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.patch(
        `${process.env.REACT_APP_API_URL}/api/doctor/appointment-status/${id}/status`, 
        { status: numericStatus }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(numericStatus === 1 ? "Patient Admitted" : "Patient Discharged");
      
      // Refresh the list to get updated patient state from DB
      await fetchAppointments();
      
      // If a patient is selected, update the local state so the UI reflects it immediately
      if(selectedApp) {
        const updatedSelected = { ...selectedApp };
        updatedSelected.patientId.state = !!numericStatus; 
        setSelectedApp(updatedSelected);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  // 2. Submit New Record & Update Patient Profile
const handleSubmitClinicalNote = async () => {
    try {
        const token = localStorage.getItem('token');
        const patientId = selectedApp.patientId._id;

        // Ensure we don't send empty strings to the history array
        if (!newHistory.trim() && !newAllergy.trim() && !currentRecord.trim()) {
            alert("Please enter some clinical data before submitting.");
            return;
        }

        // 1. Prepare the payload for your UpdatePatientMedicalHistory controller
        const historyPayload = {
            diagnosis: newHistory,          // Matches { diagnosis } in backend
            newAllergies: newAllergy ? [newAllergy] : [], // Matches { newAllergies }
            treatmentPlan: ""               // Included to match your destructured variables
        };

        // 2. Update Patient Medical Profile
        await axios.patch(
            `${process.env.REACT_APP_API_URL}/api/doctor/update-history/${patientId}/history`, 
            historyPayload, 
            { headers: { Authorization: `Bearer ${token}` } }
        );

        // 3. Save current visit to the 'Records' collection
       if (currentRecord.trim()) {
            await axios.post(
                `${process.env.REACT_APP_API_URL}/api/doctor/records/${selectedApp.patientId._id}`, 
                {
                    patientId: selectedApp.patientId._id, // Adding this just in case, though the URL has it
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
        console.error("Clinical update failed:", err.response?.data || err.message);
        alert("Error saving records: " + (err.response?.data?.message || "Check server console"));
    }
};

  if (loading) return <div className="min-h-screen bg-[#0b0f1a] flex items-center justify-center text-indigo-400 italic">Loading Appointments...</div>;

  return (
    <div className="flex min-h-screen bg-[#0b0f1a] text-white">
      <Sidebar logout={logout} />

      <main className="flex-1 flex overflow-hidden h-screen">
        {/* LEFT SIDE: List of Appointments */}
        <div className={`transition-all duration-500 overflow-y-auto p-8 custom-scrollbar ${selectedApp ? 'w-2/5' : 'w-full'}`}>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold italic">Schedule</h2>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="text" placeholder="Search Patient..." className="bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 focus:border-indigo-500 outline-none w-64" />
            </div>
          </div>

          <div className="space-y-4">
            {appointments.map((app) => (
              <motion.div 
                layout
                key={app._id}
                onClick={() => setSelectedApp(app)}
                className={`p-5 rounded-3xl cursor-pointer border transition-all ${selectedApp?._id === app._id ? 'bg-indigo-600 border-indigo-400' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center font-bold">
                      {app.patientId?.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold">{app.patientId?.name}</p>
                      <p className="text-xs opacity-60">{app.timeSlot} • {new Date(app.appointmentDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {/* Status Badge pulled from Patient State */}
                  <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-tighter ${app.patientId?.state ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {app.patientId?.state ? 'Admitted' : 'Outpatient'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE: Detail Panel */}
        <AnimatePresence>
          {selectedApp && (
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              className="w-3/5 bg-slate-900/50 border-l border-white/10 p-8 overflow-y-auto custom-scrollbar relative"
            >
              <button onClick={() => setSelectedApp(null)} className="absolute top-8 right-8 text-slate-400 hover:text-white">
                <FiX size={24} />
              </button>

              <div className="mb-8">
                <div className="flex items-center gap-3">
                   <p className="text-xs text-indigo-400 font-black uppercase tracking-[0.2em]">Patient Profile</p>
                   {selectedApp.patientId?.state && <span className="text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded font-bold uppercase">In-Ward</span>}
                </div>
                <h2 className="text-4xl font-black mt-2">{selectedApp.patientId?.name}</h2>
              </div>

              {/* Patient Quick Info Card */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <InfoChip label="Gender" value={selectedApp.patientId?.gender || "N/A"} />
                <InfoChip label="Blood Group" value={selectedApp.patientId?.bloodGroup || "O+"} />
                <InfoChip label="ID (Short)" value={selectedApp.patientId?._id?.slice(-6).toUpperCase()} />
              </div>

              {/* Status Controls */}
              <div className="mb-10">
                <p className="text-sm font-bold mb-3 text-slate-400">Manage Patient State</p>
                <div className="flex gap-3">
                  <button onClick={() => handleStatusUpdate(selectedApp._id, 1)} className={`flex-1 py-3 rounded-xl border font-bold transition-all ${selectedApp.patientId?.state ? 'bg-blue-600 text-white border-blue-400' : 'bg-blue-600/10 text-blue-400 border-blue-600/30 hover:bg-blue-600 hover:text-white'}`}>Admit</button>
                  <button onClick={() => handleStatusUpdate(selectedApp._id, 0)} className={`flex-1 py-3 rounded-xl border font-bold transition-all ${!selectedApp.patientId?.state ? 'bg-emerald-600 text-white border-emerald-400' : 'bg-emerald-600/10 text-emerald-400 border-emerald-600/30 hover:bg-emerald-600 hover:text-white'}`}>Discharge</button>
                </div>
              </div>

              {/* Medical History & Allergies */}
              <div className="space-y-6 mb-10">
                 <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                    <h4 className="flex items-center gap-2 font-bold mb-4 text-orange-400"><FiShield /> Allergies</h4>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {selectedApp.patientId?.allergies?.map((al, i) => (
                            <span key={i} className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-xs font-bold">{al}</span>
                        ))}
                    </div>
                    <input value={newAllergy} onChange={(e) => setNewAllergy(e.target.value)} placeholder="Type and submit below..." className="w-full bg-[#0b0f1a] border border-white/10 rounded-xl p-3 text-sm focus:border-orange-500 outline-none" />
                 </div>

                 <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                    <h4 className="flex items-center gap-2 font-bold mb-4 text-indigo-400"><FiFileText /> Medical History</h4>
                    <ul className="text-xs text-slate-400 space-y-2 mb-4 list-disc pl-4 italic">
                        {selectedApp.patientId?.medicalHistory?.map((h, i) => <li key={i}>{h}</li>)}
                    </ul>
                    <textarea value={newHistory} onChange={(e) => setNewHistory(e.target.value)} placeholder="Enter new diagnosis..." className="w-full bg-[#0b0f1a] border border-white/10 rounded-xl p-3 text-sm focus:border-indigo-500 outline-none h-20" />
                 </div>
              </div>

              {/* New Record Collection */}
              <div className="bg-indigo-600 p-8 rounded-[2rem] shadow-xl shadow-indigo-900/40">
                <h4 className="font-bold text-lg mb-2 text-white">Clinical Note</h4>
                <p className="text-indigo-100/60 text-[10px] mb-6 uppercase tracking-widest font-black">Finalize Visit & Save Record</p>
                <textarea 
                  value={currentRecord}
                  onChange={(e) => setCurrentRecord(e.target.value)}
                  placeholder="Clinical observations and treatment plan..." 
                  className="w-full bg-black/20 border border-white/20 rounded-2xl p-4 text-white placeholder:text-white/40 focus:bg-black/30 outline-none min-h-[150px] mb-6"
                />
                <button 
                  onClick={handleSubmitClinicalNote}
                  className="w-full py-4 bg-white text-indigo-600 font-black rounded-2xl shadow-lg hover:bg-slate-50 flex items-center justify-center gap-2 transition-transform active:scale-95"
                >
                  <FiCheckCircle /> Save & Sync Profile
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
  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-center">
    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{label}</p>
    <p className="text-sm font-bold mt-1 text-slate-200">{value}</p>
  </div>
);

export default Appointments;