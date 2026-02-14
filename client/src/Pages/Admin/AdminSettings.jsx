import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../Contexts/AuthFile';
import AdminSidebar from '../../Components/AdminSidebar';
import axios from 'axios';
import { FiSettings, FiUser, FiMail, FiShield, FiEdit3, FiLock, FiGlobe } from 'react-icons/fi';
import { motion } from 'framer-motion';

const AdminSettings = () => {
  const { logout } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/admin/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(res.data);
      } catch (err) {
        console.error("Error fetching admin profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <div className="bg-[#060910] h-screen text-white flex items-center justify-center font-black">INITIALIZING SYSTEM...</div>;

  return (
    <div className="flex h-screen bg-[#060910] text-white overflow-hidden">
      <AdminSidebar logout={logout} />

      <main className="flex-1 p-12 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <header className="mb-12">
            <h2 className="text-4xl font-black italic tracking-tighter uppercase flex items-center gap-4">
              <FiSettings className="text-indigo-500" /> System Settings
            </h2>
            <p className="text-slate-500 mt-2 font-medium">Manage your administrative credentials and security</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* PROFILE CARD */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="md:col-span-1 bg-white/5 border border-white/5 rounded-[3rem] p-8 text-center"
            >
              <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-[2.5rem] mx-auto flex items-center justify-center text-4xl shadow-2xl shadow-indigo-500/20 mb-6">
                {profile?.name?.charAt(0)}
              </div>
              <h3 className="text-xl font-black uppercase tracking-tighter">{profile?.name}</h3>
              <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mt-1">Super Administrator</p>
              
              <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
                <button className="w-full py-3 bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-indigo-500 hover:text-white transition-all">
                  Upload Avatar
                </button>
              </div>
            </motion.div>

            {/* DETAILS FORM */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="md:col-span-2 space-y-6"
            >
              <div className="bg-white/5 border border-white/5 rounded-[3rem] p-10">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-8 flex items-center gap-2">
                  <FiUser className="text-indigo-500" /> Personal Identity
                </h4>
                
                <div className="grid grid-cols-1 gap-6">
                  <SettingItem icon={<FiUser />} label="Full Administrative Name" value={profile?.name} />
                  <SettingItem icon={<FiMail />} label="System Email" value={profile?.userId?.email} />
                  <SettingItem icon={<FiShield />} label="Access Level" value={profile?.userId?.role} />
                </div>

                <div className="mt-10 pt-8 border-t border-white/5">
                  <button 
                    onClick={() => alert("Settings modification is restricted in this build.")}
                    className="flex items-center gap-2 px-8 py-4 bg-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20"
                  >
                    <FiEdit3 /> Update Profile Details
                  </button>
                </div>
              </div>

              {/* SECURITY SECTION */}
              <div className="bg-white/5 border border-white/5 rounded-[3rem] p-10">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-8 flex items-center gap-2">
                  <FiLock className="text-indigo-500" /> Security & Session
                </h4>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold">Two-Factor Authentication</p>
                    <p className="text-xs text-slate-500">Add an extra layer of security to your account</p>
                  </div>
                  <div className="w-12 h-6 bg-white/10 rounded-full relative cursor-not-allowed">
                    <div className="absolute left-1 top-1 w-4 h-4 bg-slate-600 rounded-full"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

const SettingItem = ({ icon, label, value }) => (
  <div className="flex items-center justify-between group">
    <div className="flex items-center gap-4">
      <div className="text-slate-500 group-hover:text-indigo-500 transition-colors">{icon}</div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>
        <p className="font-bold text-sm">{value}</p>
      </div>
    </div>
  </div>
);

export default AdminSettings;