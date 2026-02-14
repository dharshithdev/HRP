import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../Contexts/AuthFile';
import AdminSidebar from '../../Components/AdminSidebar';
import axios from 'axios';
import { FiSearch, FiPhone, FiMail, FiActivity, FiUser, FiTrash2, FiPower, FiCalendar, FiClock } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const DoctorManagement = () => {
  const { logout } = useContext(AuthContext);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/doctors`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDoctors(res.data);
      if (res.data.length > 0) setSelectedDoc(res.data[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDoctors(); }, []);

  const handleToggleStatus = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${process.env.REACT_APP_API_URL}/api/admin/toggle-status/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDoctors(); // Refresh list
    } catch (err) { alert("Status update failed"); }
  };

  const handleDelete = async (docId, userId) => {
    if (!window.confirm("Delete this doctor and their login credentials?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/admin/doctor/${docId}/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const updated = doctors.filter(d => d._id !== docId);
      setDoctors(updated);
      setSelectedDoc(updated[0] || null);
    } catch (err) { alert("Deletion failed"); }
  };

  const filteredDocs = doctors.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) || 
    d.specialization.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-[#060910] text-white overflow-hidden">
      <AdminSidebar logout={logout} />

      <main className="flex-1 flex overflow-hidden">
        {/* LEFT SIDE LIST */}
        <div className="w-1/3 border-r border-white/5 flex flex-col bg-[#080d17]/50">
          <div className="p-8">
            <h2 className="text-2xl font-black italic tracking-tighter uppercase mb-6">Doctor Registry</h2>
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search specialty or name..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm focus:border-indigo-500 outline-none transition-all"
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {filteredDocs.map((doc) => (
              <button
                key={doc._id}
                onClick={() => setSelectedDoc(doc)}
                className={`w-full text-left p-5 rounded-[2rem] transition-all border ${
                  selectedDoc?._id === doc._id 
                  ? 'bg-indigo-600 border-indigo-400 shadow-xl shadow-indigo-600/20' 
                  : 'bg-white/5 border-transparent hover:bg-white/10'
                }`}
              >
                <p className="font-black text-sm uppercase">{doc.name}</p>
                <p className={`text-[10px] font-bold mt-1 ${selectedDoc?._id === doc._id ? 'text-indigo-200' : 'text-indigo-500'}`}>
                  {doc.specialization}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE DETAILS */}
        <div className="flex-1 bg-[#080d17] p-12 overflow-y-auto">
          <AnimatePresence mode="wait">
            {selectedDoc ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={selectedDoc._id}>
                <div className="flex justify-between items-start mb-12">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-indigo-500/10 border border-indigo-500/20 rounded-3xl flex items-center justify-center text-3xl text-indigo-500">
                      <FiUser />
                    </div>
                    <div>
                      <h3 className="text-4xl font-black italic tracking-tighter uppercase">{selectedDoc.name}</h3>
                      <p className="text-indigo-400 font-black text-xs uppercase tracking-widest mt-1">{selectedDoc.specialization}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleToggleStatus(selectedDoc.userId?._id)} className={`p-4 rounded-2xl border transition-all ${selectedDoc.userId?.isActive ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                      <FiPower />
                    </button>
                    <button onClick={() => handleDelete(selectedDoc._id, selectedDoc.userId?._id)} className="p-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl hover:bg-red-500 hover:text-white transition-all">
                      <FiTrash2 />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <DetailBox icon={<FiMail />} label="Email" value={selectedDoc.userId?.email} />
                  <DetailBox icon={<FiPhone />} label="Contact" value={selectedDoc.phone || "Not Provided"} />
                </div>

                {/* AVAILABILITY SECTION */}
                <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-8">
                  <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-6">
                    <FiCalendar className="text-indigo-500" /> Weekly Schedule
                  </h4>
                  <div className="space-y-4">
                    {selectedDoc.availability?.length > 0 ? selectedDoc.availability.map((sched, idx) => (
                      <div key={idx} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                        <span className="font-bold text-sm">{sched.day}</span>
                        <div className="flex gap-2">
                          {sched.slots.map((slot, sIdx) => (
                            <span key={sIdx} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-mono text-indigo-300">
                              {slot}
                            </span>
                          ))}
                        </div>
                      </div>
                    )) : (
                      <p className="text-slate-600 text-xs italic">No availability set for this week.</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex items-center justify-center opacity-10">
                <FiActivity size={100} />
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

const DetailBox = ({ icon, label, value }) => (
  <div className="bg-white/5 border border-white/5 p-6 rounded-3xl">
    <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">
      {icon} {label}
    </div>
    <p className="font-bold">{value}</p>
  </div>
);

export default DoctorManagement;