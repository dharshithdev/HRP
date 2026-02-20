import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../Contexts/AuthFile';
import StaffSidebar from '../../Components/StaffSidebar';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiSend, FiInfo, FiCheckCircle, FiX, FiShield, FiMenu } from 'react-icons/fi';

const Alert = () => {
  const { logout } = useContext(AuthContext);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' });

  // Mobile sidebar toggle state (if your Sidebar component needs it)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (status.msg) {
      const timer = setTimeout(() => setStatus({ type: '', msg: '' }), 6000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleBroadcast = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${process.env.REACT_APP_API_URL}/api/staff/alerts`, { notice }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStatus({ type: 'success', msg: 'Broadcast dispatched successfully.' });
      setNotice("");
      setShowConfirm(false);
    } catch (err) {
      setStatus({ type: 'error', msg: 'Protocol failed. Check uplink.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    // changed from flex to block on mobile, flex on large screens
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#060910] text-white">
      
      {/* Sidebar - Ensure it's hidden on mobile or handled by your component */}
      <StaffSidebar logout={logout} isOpen={isSidebarOpen} />

      <main className="flex-1 w-full relative">
        {/* MOBILE HEADER - Only visible on small screens */}
        <div className="lg:hidden flex items-center justify-between p-6 border-b border-white/5 bg-[#0b0f1a]">
            <h2 className="text-xl font-black italic">HRP</h2>
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-white/5 rounded-lg">
                <FiMenu size={24} />
            </button>
        </div>

        {/* CONTENT AREA */}
        <div className="p-6 lg:p-12 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] lg:min-h-screen">
          
          <div className="w-full max-w-2xl">
            <header className="mb-8 lg:mb-12 text-center">
              <div className="inline-flex p-4 lg:p-5 bg-red-500/10 rounded-2xl lg:rounded-3xl mb-6 border border-red-500/20 shadow-lg">
                <FiAlertTriangle className="text-3xl lg:text-4xl text-red-500 animate-pulse" />
              </div>
              <h2 className="text-3xl lg:text-5xl font-black italic tracking-tighter uppercase leading-none">Broadcast</h2>
              <p className="text-slate-500 mt-4 text-xs lg:text-sm font-medium px-4">System-wide emergency notification protocol</p>
            </header>

            <AnimatePresence>
              {status.msg && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className={`mb-6 p-4 lg:p-5 rounded-2xl flex items-center justify-between border ${
                    status.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}
                >
                  <span className="font-black uppercase tracking-widest text-[10px] flex items-center gap-2">
                    {status.type === 'success' ? <FiCheckCircle /> : <FiAlertTriangle />} {status.msg}
                  </span>
                  <FiX className="cursor-pointer" onClick={() => setStatus({ type: '', msg: '' })} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* FORM CONTAINER - Use w-full and avoid fixed widths */}
            <div className="bg-white/5 p-6 lg:p-10 rounded-[2rem] lg:rounded-[3rem] border border-white/5 backdrop-blur-xl w-full">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-4 block ml-1">
                Notice Content
              </label>
              
              <textarea 
                value={notice}
                onChange={(e) => setNotice(e.target.value)}
                placeholder="Type emergency notice here..."
                className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 lg:p-6 h-48 lg:h-56 outline-none focus:border-red-500/50 transition-all text-base lg:text-lg leading-relaxed resize-none font-medium"
              />
              
              <div className="mt-6 flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/5">
                <FiShield className="text-indigo-500 shrink-0 mt-0.5" />
                <p className="text-[10px] lg:text-[11px] text-slate-500 leading-normal">
                  Dispatching this alert will interrupt all active medical terminals. Authorized personnel only.
                </p>
              </div>

              <button 
                onClick={() => setShowConfirm(true)}
                disabled={loading || !notice.trim()}
                className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-30 text-white py-5 lg:py-6 rounded-2xl lg:rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] lg:text-xs flex items-center justify-center gap-3 transition-all mt-8 shadow-xl active:scale-95"
              >
                Dispatch Alert <FiSend />
              </button>
            </div>
          </div>
        </div>

        {/* CONFIRMATION OVERLAY */}
        <AnimatePresence>
          {showConfirm && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-end lg:items-center justify-center p-4"
            >
              <motion.div 
                initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
                className="bg-[#0b0f1a] border border-red-500/20 p-8 lg:p-10 rounded-t-[2rem] lg:rounded-[3rem] max-w-md w-full text-center shadow-2xl"
              >
                <h3 className="text-xl lg:text-2xl font-black italic uppercase tracking-tighter mb-4">Confirm Broadcast?</h3>
                <p className="text-slate-400 text-xs lg:text-sm mb-8">This will be pushed to all users immediately.</p>
                <div className="flex flex-col gap-3">
                  <button onClick={handleBroadcast} className="w-full bg-red-600 py-4 rounded-xl font-black uppercase text-xs tracking-widest">Yes, Send</button>
                  <button onClick={() => setShowConfirm(false)} className="w-full bg-white/5 py-4 rounded-xl font-black uppercase text-xs tracking-widest text-slate-500">Cancel</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Alert;