import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../Contexts/AuthFile';
import Sidebar from '../../Components/DocSidebar';
import { FiUser, FiMail, FiPhone, FiBriefcase, FiSave } from 'react-icons/fi';

const Settings = () => {
  const { user, logout } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: ''
  });
  const [loading, setLoading] = useState(true);

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
    // Logic left blank as requested
    alert("Update functionality is not implemented yet.");
  };

  if (loading) return <div className="min-h-screen bg-[#0b0f1a] flex items-center justify-center text-indigo-400">Loading Profile...</div>;

  return (
    <div className="flex min-h-screen bg-[#0b0f1a] text-white">
      <Sidebar logout={logout} />
      
      <main className="flex-1 p-12">
        <header className="mb-10">
          <h2 className="text-4xl font-black italic">Account Settings</h2>
          <p className="text-slate-500 mt-2">Manage your professional profile and contact information</p>
        </header>

        <div className="max-w-2xl bg-white/5 border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-sm">
          <form onSubmit={handleUpdate} className="space-y-6">
            
            <InputGroup 
              label="Full Name" 
              icon={<FiUser />} 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />

            <InputGroup 
              label="Email Address" 
              icon={<FiMail />} 
              value={formData.email} 
              disabled={true} // Email usually shouldn't be edited easily
            />

            <InputGroup 
              label="Specialization" 
              icon={<FiBriefcase />} 
              value={formData.specialization} 
              onChange={(e) => setFormData({...formData, specialization: e.target.value})}
            />

            <InputGroup 
              label="Phone Number" 
              icon={<FiPhone />} 
              value={formData.phone} 
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />

            <button 
              type="submit"
              className="w-full mt-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-900/20"
            >
              <FiSave /> Save Changes
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

const InputGroup = ({ label, icon, value, onChange, disabled = false }) => (
  <div className="space-y-2">
    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400">
        {icon}
      </div>
      <input 
        type="text" 
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full bg-black/20 border border-white/10 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-indigo-500 transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      />
    </div>
  </div>
);

export default Settings;