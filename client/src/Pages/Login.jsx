import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../Contexts/AuthFile';
import axios from 'axios';
import { FiLock, FiMail, FiShield } from 'react-icons/fi';

const Login = () => {
  const { user, loading, login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      const path = 
        user.role === 'Admin' ? '/admin/dashboard' : 
        user.role === 'Doctor' ? '/doctor/dashboard' : '/staff/dashboard';
      navigate(path, { replace: true });
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, formData);
      const { token, user: userData } = response.data;
      localStorage.setItem('token', token);
      login(userData); 
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials or server error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || user) return null;

  return (
    // Uses 100dvh to handle mobile browser address bars accurately
    <div className="min-h-[100dvh] flex items-center justify-center bg-[#060910] relative overflow-hidden font-sans px-4 py-8">
      
      {/* Background Ambience - Simplified for Mobile Performance */}
      <div className="absolute top-[-10%] left-[-10%] w-[300px] lg:w-[600px] h-[300px] lg:h-[600px] bg-indigo-600/10 rounded-full blur-[80px] lg:blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[300px] lg:w-[600px] h-[300px] lg:h-[600px] bg-purple-600/10 rounded-full blur-[80px] lg:blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="z-10 w-full max-w-[420px]"
      >
        {/* Branding Section */}
        <div className="text-center mb-8 lg:mb-10">
          <motion.div
            initial={{ y: -10 }}
            animate={{ y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6"
          >
            <FiShield className="text-indigo-400 text-[10px]" />
            <span className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]">Secure Gateway</span>
          </motion.div>
          
          <h1 className="text-6xl lg:text-8xl font-black text-white tracking-tighter leading-none italic">
            HRP<span className="text-indigo-500">.</span>
          </h1>
          <p className="text-slate-500 text-xs lg:text-sm mt-3 font-bold uppercase tracking-widest opacity-60">Resource Planning System</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 lg:p-10 shadow-2xl relative">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Login</h2>
            <p className="text-slate-500 text-xs font-medium mt-1">Access restricted medical database</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-bold py-3 px-4 rounded-xl flex items-center gap-3"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email Field */}
            <div className="space-y-2 group">
              <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest ml-1 group-focus-within:text-indigo-400 transition-colors">Credential Link</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
                <input 
                  required
                  type="email" 
                  autoComplete="email"
                  placeholder="name@hospital.com"
                  className="w-full bg-black/40 border border-white/5 rounded-2xl px-12 py-4 text-white placeholder:text-slate-700 focus:outline-none focus:border-indigo-500/50 transition-all text-sm font-medium"
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2 group">
              <div className="flex justify-between items-center ml-1">
                <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest group-focus-within:text-indigo-400 transition-colors">Access Key</label>
              </div>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
                <input 
                  required
                  type="password" 
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full bg-black/40 border border-white/5 rounded-2xl px-12 py-4 text-white placeholder:text-slate-700 focus:outline-none focus:border-indigo-500/50 transition-all text-sm font-medium"
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-5 rounded-2xl font-black text-[10px] lg:text-xs uppercase tracking-[0.2em] text-white transition-all mt-4 shadow-xl active:scale-[0.98] ${
                isSubmitting 
                ? 'bg-slate-800 cursor-wait' 
                : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/20'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Authorizing...
                </span>
              ) : 'Establish Connection'}
            </button>
          </form>

          {/* Footer Decoration */}
          <div className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center gap-2">
            <p className="text-[9px] text-slate-600 uppercase tracking-[0.2em] font-bold">
              Secure Terminal &bull; Layer 7 Encrypted
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;