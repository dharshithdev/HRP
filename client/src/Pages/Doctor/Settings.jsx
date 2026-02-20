import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../Contexts/AuthFile';
import Sidebar from '../../Components/DocSidebar';
import { FiUser, FiMail, FiPhone, FiBriefcase, FiSave, FiSettings, FiCheckCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';

const Settings = () => {
  const { user, logout } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: ''
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/doctor/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setFormData({
          name: res.data.name || 'Unknown Doctor',
          email: res.data.userId?.email || 'No email found',
          phone: res.data.phone || 'Not provided',
          specialization: res.data.specialization || 'General'
        });
      } catch (err) {
        console.error("Error loading profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate API delay since logic is "not implemented yet"
    setTimeout(() => {
        setIsSaving(false);
        alert("Update functionality is not implemented yet, but the UI is ready!");
    }, 1000);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0b0f1a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-indigo-400 text-xs font-black uppercase tracking-widest">Retrieving Credentials...</p>
        </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#0b0f1a] text-white">
      <Sidebar logout={logout} />
      
      <main className="flex-1 p-6 lg:p-12 overflow-y-auto">
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <FiSettings className="text-indigo-500 animate-spin-slow" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">System Preferences</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-black italic tracking-tighter uppercase">Account Settings</h2>
          <p className="text-slate-500 mt-2 text-sm">Update your professional identity and system notification preferences</p>
        </header>

        <div className="max-w-3xl flex flex-col gap-8">
          
          {/* Profile Card Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-8 rounded-[2rem] flex flex-col sm:flex-row items-center gap-6 shadow-xl shadow-indigo-900/20">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-3xl font-black border border-white/20">
              {formData.name.charAt(0)}
            </div>
            <div className="text-center sm:text-left">
                <h3 className="text-2xl font-black italic uppercase tracking-tighter">{formData.name}</h3>
                <p className="text-indigo-100/70 text-sm font-medium">{formData.specialization}</p>
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-black/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                    <FiCheckCircle className="text-emerald-400" /> Verified Medical Professional
                </div>
            </div>
          </div>

          {/* Form Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6 lg:p-10 backdrop-blur-sm"
          >
            <form onSubmit={handleUpdate} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup 
                  label="Full Name" 
                  icon={<FiUser />} 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />

                <InputGroup 
                  label="Email Address (Login)" 
                  icon={<FiMail />} 
                  value={formData.email} 
                  disabled={true} 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup 
                  label="Primary Specialization" 
                  icon={<FiBriefcase />} 
                  value={formData.specialization} 
                  onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                />

                <InputGroup 
                  label="Contact Phone" 
                  icon={<FiPhone />} 
                  value={formData.phone} 
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>

              <div className="pt-6 border-t border-white/5">
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-900/40 active:scale-95 disabled:opacity-50"
                >
                  {isSaving ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <FiSave /> Sync Profile Changes
                    </>
                  )}
                </button>
                <p className="text-center text-[9px] text-slate-500 mt-4 uppercase font-bold tracking-widest">
                    Last password change: 14 days ago
                </p>
              </div>
            </form>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

const InputGroup = ({ label, icon, value, onChange, disabled = false }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 group-focus-within:text-indigo-300 transition-colors">
        {icon}
      </div>
      <input 
        type="text" 
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm font-bold outline-none focus:border-indigo-500 focus:bg-black/60 transition-all ${disabled ? 'opacity-40 cursor-not-allowed border-dashed' : 'hover:border-white/20'}`}
      />
    </div>
  </div>
);

export default Settings;