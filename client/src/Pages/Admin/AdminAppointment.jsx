import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../Contexts/AuthFile';
import AdminSidebar from '../../Components/AdminSidebar';
import axios from 'axios';
import { FiCalendar, FiCheckCircle, FiXCircle, FiClock, FiSearch, FiFilter, FiUser, FiActivity } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const AdminAppointments = () => {
  const { logout } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/appointments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchAppointments(); }, []);

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${process.env.REACT_APP_API_URL}/api/admin/appointment/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAppointments();
    } catch (err) { alert("Update failed"); }
  };

  const filtered = appointments.filter(app => {
    const matchesStatus = filter === "All" || app.status === filter;
    const matchesSearch = 
      app.patientId?.name?.toLowerCase().includes(search.toLowerCase()) || 
      app.doctorId?.name?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#060910] text-white">
      <AdminSidebar logout={logout} />

      <main className="flex-1 p-5 sm:p-8 lg:p-10 overflow-y-auto">
        <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-10">
          <div>
            <h2 className="text-3xl lg:text-4xl font-black italic tracking-tighter uppercase">Appointments</h2>
            <p className="text-slate-500 font-medium text-sm lg:text-base">Global visit monitoring</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
            <div className="relative flex-1 sm:w-64 lg:w-80">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search patient/doctor..."
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-xs focus:border-indigo-500 outline-none transition-all"
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <select 
                className="flex-1 sm:flex-none bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest outline-none focus:border-indigo-500"
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </header>

        {/* DESKTOP TABLE VIEW (Hidden on Mobile/Tablet) */}
        <div className="hidden md:block bg-white/5 border border-white/5 rounded-[2.5rem] overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                <th className="p-6">Patient</th>
                <th className="p-6">Assigned Doctor</th>
                <th className="p-6">Date & Time</th>
                <th className="p-6">Status</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              <AnimatePresence>
                {filtered.map((app, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    key={app._id} className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="p-6 font-bold">{app.patientId?.name || "Unknown"}</td>
                    <td className="p-6">
                      <p className="font-bold text-indigo-400">{app.doctorId?.name || 'Unassigned'}</p>
                      <p className="text-[10px] text-slate-500 uppercase">{app.doctorId?.specialization}</p>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        <FiCalendar className="text-slate-500" />
                        {new Date(app.appointmentDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 text-xs mt-1">
                        <FiClock /> {app.timeSlot}
                      </div>
                    </td>
                    <td className="p-6">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ActionButton icon={<FiCheckCircle />} color="emerald" onClick={() => updateStatus(app._id, 'Confirmed')} />
                        <ActionButton icon={<FiXCircle />} color="red" onClick={() => updateStatus(app._id, 'Cancelled')} />
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* MOBILE CARD VIEW (Hidden on Desktop) */}
        <div className="md:hidden space-y-4">
          {filtered.map((app) => (
            <div key={app._id} className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-black text-lg uppercase italic tracking-tighter">{app.patientId?.name}</h4>
                  <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold mt-1">
                    <FiActivity size={12}/> {app.doctorId?.name}
                  </div>
                </div>
                <StatusBadge status={app.status} />
              </div>
              
              <div className="flex gap-4 mb-6 text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1"><FiCalendar className="text-indigo-500"/> {new Date(app.appointmentDate).toLocaleDateString()}</span>
                <span className="flex items-center gap-1"><FiClock className="text-indigo-500"/> {app.timeSlot}</span>
              </div>

              <div className="flex gap-2 pt-4 border-t border-white/5">
                <button 
                  onClick={() => updateStatus(app._id, 'Confirmed')}
                  className="flex-1 bg-emerald-500/10 text-emerald-500 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-500/20"
                >
                  Confirm
                </button>
                <button 
                  onClick={() => updateStatus(app._id, 'Cancelled')}
                  className="flex-1 bg-red-500/10 text-red-500 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-500/20"
                >
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="p-20 text-center text-slate-600 font-black uppercase tracking-widest text-xs">
            No active schedules found
          </div>
        )}
      </main>
    </div>
  );
};

const ActionButton = ({ icon, color, onClick }) => {
  const colors = {
    emerald: "hover:bg-emerald-500/20 text-emerald-500",
    red: "hover:bg-red-500/20 text-red-500"
  };
  return (
    <button onClick={onClick} className={`p-2 rounded-lg transition-all ${colors[color]}`}>
      {React.cloneElement(icon, { size: 18 })}
    </button>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    Pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    Confirmed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    Cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
    Completed: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${styles[status] || styles.Pending}`}>
      {status}
    </span>
  );
};

export default AdminAppointments;