import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiShieldOff, FiArrowLeft, FiAlertTriangle } from 'react-icons/fi';
import { motion } from 'framer-motion';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#060910] flex items-center justify-center p-6 overflow-hidden relative">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-md w-full text-center relative z-10">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8 relative inline-block"
        >
          <div className="w-24 h-24 bg-red-500/10 border border-red-500/20 rounded-[2rem] flex items-center justify-center mx-auto relative z-10">
            <FiShieldOff size={48} className="text-red-500" />
          </div>
          {/* Decorative "Warning" floating icon */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute -top-2 -right-2 bg-red-500 p-2 rounded-full shadow-lg shadow-red-500/40"
          >
            <FiAlertTriangle size={16} className="text-white" />
          </motion.div>
        </motion.div>

        <h1 className="text-5xl font-black italic tracking-tighter mb-4 text-white uppercase italic">
          Access <span className="text-red-500">Denied</span>
        </h1>
        
        <p className="text-slate-500 text-sm leading-relaxed mb-10 font-medium">
          Your credentials do not grant authorization for this sector. 
          This attempt has been logged for security audit purposes.
        </p>

        <div className="space-y-4">
          <button 
            onClick={() => navigate(-1)} 
            className="w-full py-4 bg-white text-black font-black text-xs uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-200 transition-all active:scale-95"
          >
            <FiArrowLeft size={18} /> Go Back One Step
          </button>

          <button 
            onClick={() => navigate('/')} 
            className="w-full py-4 bg-white/5 border border-white/10 text-slate-400 font-bold text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-white/10 hover:text-white transition-all"
          >
            Return to Terminal
          </button>
        </div>

        {/* System Code Footer */}
        <div className="mt-12 opacity-20 flex justify-center gap-4 font-mono text-[10px] text-red-500">
          <span>ERROR_CODE: 403_FORBIDDEN</span>
          <span>SRV_NODE: ALPHA_9</span>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;