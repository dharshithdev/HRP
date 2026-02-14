import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../Contexts/AuthFile';
import AdminSidebar from '../../Components/AdminSidebar';
import axios from 'axios';
import { FiUser, FiSearch, FiPhone, FiCalendar, FiClipboard } from 'react-icons/fi';
import { motion } from 'framer-motion';

const AdminPatients = () => {
  const { logout } = useContext(AuthContext);
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/patients`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPatients(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPatients();
  }, []);

  const filtered = patients.filter(p => 
    p._id?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#060910] text-white">
      <AdminSidebar logout={logout} />

      <main className="flex-1 p-10 overflow-y-auto">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h2 className="text-4xl font-black italic tracking-tighter uppercase">Patient Registry</h2>
            <p className="text-slate-500 font-medium">Historical data of all treated individuals</p>
          </div>
          
          <div className="relative w-72">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Filter by name..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-xs focus:border-indigo-500 outline-none"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filtered.map((patient, i) => (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              key={i}
              className="bg-white/5 border border-white/5 rounded-[2.5rem] p-8 hover:bg-white/[0.07] transition-all group"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 text-xl border border-indigo-500/20 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <FiUser />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{patient.name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                      <FiPhone className="text-indigo-500" /> {patient.phone || "No contact info"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-black px-3 py-1 rounded-full border border-indigo-500/20">
                    {patient.totalVisits} VISITS
                  </span>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="bg-black/20 rounded-2xl p-4 border border-white/5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 flex items-center gap-2">
                    <FiCalendar /> Last Visit
                  </p>
                  <p className="text-sm font-bold">
                    {new Date(patient.lastVisit).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="bg-black/20 rounded-2xl p-4 border border-white/5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 flex items-center gap-2">
                    <FiClipboard /> Recent Care
                  </p>
                  <p className="text-sm font-bold truncate">
                    {patient.recentDoctor?.name || "N/A"}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="mt-20 text-center opacity-20 italic">
            No patient records found in the system archives.
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPatients;