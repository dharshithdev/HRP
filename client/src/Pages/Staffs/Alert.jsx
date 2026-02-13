import React, { useState, useContext } from 'react';
import { AuthContext } from '../../Contexts/AuthFile';
import StaffSidebar from '../../Components/StaffSidebar';
import axios from 'axios';
import { FiAlertTriangle, FiSend, FiInfo, FiCheckCircle } from 'react-icons/fi';

const Alert = () => {
  const { logout } = useContext(AuthContext);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' });

  const handleBroadcast = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', msg: '' });

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/staff/alerts', { notice }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setStatus({ type: 'success', msg: 'Emergency alert broadcasted to all departments.' });
      setNotice(""); // Clear input
    } catch (err) {
      setStatus({ type: 'error', msg: 'Failed to send alert. Check connection.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#060910] text-white">
      <StaffSidebar logout={logout} />

      <main className="flex-1 p-10 flex flex-col items-center justify-center">
        <div className="max-w-2xl w-full">
          <header className="mb-10 text-center">
            <div className="inline-flex p-4 bg-red-500/10 rounded-full mb-4 border border-red-500/20">
              <FiAlertTriangle className="text-4xl text-red-500 animate-pulse" />
            </div>
            <h2 className="text-4xl font-black italic tracking-tighter">EMERGENCY BROADCAST</h2>
            <p className="text-slate-500 mt-2">Send urgent notices to all medical staff and administrators</p>
          </header>

          {status.msg && (
            <div className={`mb-8 p-4 rounded-2xl flex items-center gap-3 font-bold text-sm ${
              status.type === 'success' 
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}>
              {status.type === 'success' ? <FiCheckCircle /> : <FiAlertTriangle />}
              {status.msg}
            </div>
          )}

          <form onSubmit={handleBroadcast} className="space-y-6">
            <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-sm">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4 block ml-1">
                Notice Content
              </label>
              <textarea 
                value={notice}
                onChange={(e) => setNotice(e.target.value)}
                placeholder="Example: ER is currently at full capacity. Redirect non-critical cases to Sector B."
                className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 h-48 outline-none focus:border-red-500 transition-all text-lg leading-relaxed resize-none"
                required
              />
              
              <div className="mt-6 flex items-start gap-3 p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
                <FiInfo className="text-indigo-400 mt-1 shrink-0" />
                <p className="text-xs text-slate-500 leading-relaxed">
                  This notice will appear immediately on the top of the Doctor and Admin dashboards. Use this only for critical operational updates.
                </p>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading || !notice.trim()}
              className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:hover:bg-red-600 text-white py-5 rounded-[2rem] font-black flex items-center justify-center gap-3 transition-all shadow-xl shadow-red-900/20 group"
            >
              {loading ? "Broadcasting..." : (
                <>
                  BROADCAST ALERT <FiSend className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Alert;