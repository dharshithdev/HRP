import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../Contexts/AuthFile';
import AdminSidebar from '../../Components/AdminSidebar';
import axios from 'axios';
import { FiCalendar, FiCheckCircle, FiXCircle, FiClock, FiSearch, FiFilter } from 'react-icons/fi';
import { motion } from 'framer-motion';

const AdminAppointments = () => {
  const { logout } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/admin/appointments', {
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
      await axios.patch(`http://localhost:5000/api/admin/appointment/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAppointments();
    } catch (err) { alert("Update failed"); }
  };

  const filtered = appointments.filter(app => {
    const matchesStatus = filter === "All" || app.status === filter;
    const matchesSearch = app.patientName?.toLowerCase().includes(search.toLowerCase()) || 
                          app.doctorId?.name?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="flex min-h-screen bg-[#060910] text-white">
      <AdminSidebar logout={logout} />

      <main className="flex-1 p-10 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h2 className="text-4xl font-black italic tracking-tighter uppercase">Appointments</h2>
            <p className="text-slate-500 font-medium">Global visit monitoring</p>
          </div>

          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search patient/doctor..."
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-xs focus:border-indigo-500 outline-none"
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select 
              className="bg-white/5 border border-white/10 rounded-xl px-4 text-xs font-bold outline-none focus:border-indigo-500"
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </header>

        {/* TABLE VIEW */}
        <div className="bg-white/5 border border-white/5 rounded-[2.5rem] overflow-hidden">
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
              {filtered.map((app, i) => (
                <motion.tr 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                  key={app._id} className="hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="p-6 font-bold">{app.patientName}</td>
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
                      <button 
                        onClick={() => updateStatus(app._id, 'Completed')}
                        className="p-2 hover:bg-emerald-500/20 text-emerald-500 rounded-lg transition-colors" title="Confirm"
                      >
                        <FiCheckCircle size={18} />
                      </button>
                      <button 
                        onClick={() => updateStatus(app._id, 'Cancelled')}
                        className="p-2 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors" title="Cancel"
                      >
                        <FiXCircle size={18} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-20 text-center text-slate-600 font-bold uppercase tracking-widest">
              No appointments found
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    Pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    Confirmed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    Cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[status]}`}>
      {status}
    </span>
  );
};

export default AdminAppointments;