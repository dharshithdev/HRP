 import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../Contexts/AuthFile';
import DoctorSidebar from '../../Components/DocSidebar';
import axios from 'axios';
import { FiBell, FiAlertCircle, FiClock, FiRefreshCw, FiCheckCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';

const CheckAlerts = () => {
  const { logout } = useContext(AuthContext);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/doctor/alerts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlerts(res.data);
    } catch (err) {
      console.error("Error fetching alerts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#060910] text-white">
      <DoctorSidebar logout={logout} />

      <main className="flex-1 p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-4xl font-black italic tracking-tighter">STAFF NOTICES</h2>
            <p className="text-slate-500 mt-2">Latest operational updates from hospital management</p>
          </div>
          <button 
            onClick={fetchAlerts}
            className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-indigo-400"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
          </button>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 opacity-50">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-xs font-black uppercase tracking-widest">Syncing with hospital server...</p>
          </div>
        ) : (
          <div className="max-w-4xl space-y-4">
            {alerts.length > 0 ? (
              alerts.map((alert, index) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  key={alert._id}
                  className={`p-6 rounded-[2rem] border flex gap-6 items-start transition-all ${
                    index === 0 
                    ? 'bg-indigo-600/10 border-indigo-500/30' 
                    : 'bg-white/5 border-white/5'
                  }`}
                >
                  <div className={`p-4 rounded-2xl shrink-0 ${
                    index === 0 ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-500'
                  }`}>
                    {index === 0 ? <FiBell size={24} className="animate-bounce" /> : <FiAlertCircle size={24} />}
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${
                        index === 0 ? 'text-indigo-400' : 'text-slate-600'
                      }`}>
                        {index === 0 ? 'Latest Broadcast' : 'Previous Notice'}
                      </span>
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                        <FiClock /> {new Date(alert.createdAt).toLocaleString()}                      </div>
                    </div>
                    <p className={`text-lg leading-relaxed ${index === 0 ? 'font-bold' : 'text-slate-300'}`}>
                      {alert.notice}
                    </p>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-20 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
                <FiCheckCircle className="mx-auto text-4xl text-slate-700 mb-4" />
                <h3 className="text-xl font-bold text-slate-500">No active alerts</h3>
                <p className="text-sm text-slate-600">You are all caught up with staff communications.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default CheckAlerts;