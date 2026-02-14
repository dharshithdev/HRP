import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../Contexts/AuthFile';
import axios from 'axios';

const Login = () => {
  const { user, loading, login } = useContext(AuthContext);
  const navigate = useNavigate();

  // 1. Form & UI State
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 2. Flicker Prevention: Redirect immediately if user is already in context
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
      // Ensure this URL matches your backend port/route
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, formData);
      
      const { token, user: userData } = response.data;

      // Store token
      localStorage.setItem('token', token);
      
      // Update Context (This also triggers the redirect)
      login(userData); 
      
    } catch (err) {
      console.error("Login Error:", err);
      setError(err.response?.data?.message || 'Invalid credentials or server error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If we are checking auth, show nothing to prevent the login form from flashing
  if (loading || user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0f1a] relative overflow-hidden font-sans">
      
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="z-10 w-full max-w-md px-4"
      >
        {/* Branding Section */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="inline-block px-4 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-4"
          >
            <span className="text-indigo-400 text-xs font-bold uppercase tracking-widest">Secure Portal</span>
          </motion.div>
          
          <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-slate-500 tracking-tighter">
            HRP
          </h1>
          <p className="text-slate-500 text-sm mt-2 font-medium">Hospital Resource Planning System</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 shadow-2xl relative">
          <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-slate-400 text-sm mb-8">Enter your credentials</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Error Message Display */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs py-3 px-4 rounded-xl flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-slate-300 text-xs font-bold uppercase tracking-wider ml-1">Email</label>
              <input 
                required
                type="email" 
                autoComplete="email"
                placeholder="doctor@hrp.com"
                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3.5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner"
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-slate-300 text-xs font-bold uppercase tracking-wider">Password</label>
                <button type="button" className="text-indigo-400 text-[10px] hover:underline uppercase font-bold tracking-tighter">Forgot?</button>
              </div>
              <input 
                required
                type="password" 
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3.5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest text-white transition-all shadow-lg ${
                isSubmitting 
                ? 'bg-slate-800 cursor-wait' 
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-indigo-500/25'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Verifying...
                </span>
              ) : 'Login to System'}
            </motion.button>
          </form>

          {/* Footer Decoration */}
          <div className="mt-8 pt-6 border-t border-white/5">
            <p className="text-center text-[10px] text-slate-600 uppercase tracking-[0.2em]">
              Authorized Personnel Only &bull; Secure Encrypted Connection
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;