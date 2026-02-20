import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../Contexts/AuthFile';
import Sidebar from '../../Components/DocSidebar'; // Using consistent Sidebar name
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
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/doctor/alerts`, {
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
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#060910] text-white">
      <Sidebar logout={logout} />

      <main className="flex-1 p-5 sm:p-10 overflow-y-auto">
        <header className="flex flex-row justify-between items-center mb-10 gap-4">
          <div>
            <h2 className="text-2xl sm:text-4xl font-black italic tracking-tighter uppercase">Staff Notices</h2>
            <p className="text-slate-500 mt-2 text-xs sm:text-sm font-medium">Latest operational updates from management</p>
          </div>
          <button 
            onClick={fetchAlerts}
            disabled={loading}
            className="p-3 sm:p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-indigo-400 active:scale-90 disabled:opacity-50"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} size={20} />
          </button>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 opacity-50">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Syncing HQ Broadcasts...</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-4">
            {alerts.length > 0 ? (
              alerts.map((alert, index) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  key={alert._id}
                  className={`p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border flex flex-col sm:flex-row gap-4 sm:gap-6 items-start transition-all ${
                    index === 0 
                    ? 'bg-indigo-600/10 border-indigo-500/30 shadow-lg shadow-indigo-500/5' 
                    : 'bg-white/5 border-white/5'
                  }`}
                >
                  <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl shrink-0 ${
                    index === 0 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-white/5 text-slate-500'
                  }`}>
                    {index === 0 ? <FiBell size={20} className="animate-pulse" /> : <FiAlertCircle size={20} />}
                  </div>

                  <div className="flex-1 w-full">
                    <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
                      <span className={`text-[9px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded ${
                        index === 0 ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-slate-600'
                      }`}>
                        {index === 0 ? 'Urgent Broadcast' : 'Archived Notice'}
                      </span>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono font-bold bg-white/5 px-2 py-1 rounded-lg">
                        <FiClock className="text-indigo-500" /> {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(alert.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <p className={`text-sm sm:text-base leading-relaxed ${index === 0 ? 'font-bold text-white' : 'text-slate-400 font-medium'}`}>
                      {alert.notice}
                    </p>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-20 bg-white/5 rounded-[2rem] sm:rounded-[3rem] border border-dashed border-white/10">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiCheckCircle className="text-3xl text-slate-700" />
                </div>
                <h3 className="text-lg font-black text-slate-500 uppercase tracking-tighter italic">Clear Skies</h3>
                <p className="text-xs text-slate-600 font-medium mt-1">No active system alerts or staff notices.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default CheckAlerts;