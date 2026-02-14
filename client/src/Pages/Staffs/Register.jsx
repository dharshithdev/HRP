import React, { useState, useContext } from 'react';
import { AuthContext } from '../../Contexts/AuthFile';
import StaffSidebar from '../../Components/StaffSidebar';
import axios from 'axios';
import { FiUser, FiHash, FiDroplet, FiPhone, FiAlertCircle, FiPlus, FiX, FiCheckCircle } from 'react-icons/fi';

const Register = () => {
  const { logout } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    bloodGroup: '',
    contact: '',
    medicalHistory: [],
    allergies: []
  });

  const [historyInput, setHistoryInput] = useState("");
  const [allergyInput, setAllergyInput] = useState("");
  const [status, setStatus] = useState({ type: '', msg: '' });

  const handleAddItem = (e, field) => {
    if (e.key === 'Enter' && e.target.value.trim() !== "") {
      e.preventDefault();
      setFormData({
        ...formData,
        [field]: [...formData[field], e.target.value.trim()]
      });
      field === 'medicalHistory' ? setHistoryInput("") : setAllergyInput("");
    }
  };

  const removeItem = (index, field) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${process.env.REACT_APP_API_URL}/api/staff/register`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStatus({ type: 'success', msg: 'Patient registered successfully!' });
      setFormData({ name: '', age: '', gender: 'Male', bloodGroup: '', contact: '', medicalHistory: [], allergies: [] });
    } catch (err) {
      setStatus({ type: 'error', msg: err.response?.data?.error || 'Registration failed' });
    }
  };

  return (
    <div className="flex min-h-screen bg-[#060910] text-white">
      <StaffSidebar logout={logout} />

      <main className="flex-1 p-10 overflow-y-auto">
        <header className="mb-10">
          <h2 className="text-4xl font-black italic">Patient Intake</h2>
          <p className="text-slate-500 mt-2">Enter the new patient's details to create a permanent record</p>
        </header>

        {status.msg && (
          <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 font-bold ${status.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
            <FiCheckCircle /> {status.msg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-8 max-w-5xl">
          {/* Section 1: Basic Info */}
          <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 space-y-6">
            <h3 className="text-lg font-bold text-indigo-400 mb-4 flex items-center gap-2"><FiUser /> Personal Details</h3>
            
            <InputGroup label="Full Name" icon={<FiUser />} value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="John Doe" required />
            
            <div className="grid grid-cols-2 gap-4">
              <InputGroup label="Age" type="number" icon={<FiHash />} value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} placeholder="25" />
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Gender</label>
                <select 
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-indigo-500 transition-all text-sm"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <InputGroup label="Blood Group" icon={<FiDroplet />} value={formData.bloodGroup} onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})} placeholder="O+ve" />
              <InputGroup label="Contact" icon={<FiPhone />} value={formData.contact} onChange={(e) => setFormData({...formData, contact: e.target.value})} placeholder="+91..." required />
            </div>
          </div>

          {/* Section 2: Medical Info */}
          <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 space-y-6">
            <h3 className="text-lg font-bold text-indigo-400 mb-4 flex items-center gap-2"><FiAlertCircle /> Medical Context</h3>
            
            {/* Tag Input for Medical History */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Medical History (Press Enter)</label>
              <input 
                type="text" value={historyInput} onChange={(e) => setHistoryInput(e.target.value)}
                onKeyDown={(e) => handleAddItem(e, 'medicalHistory')}
                placeholder="e.g. Diabetes, Asthma"
                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-indigo-500 transition-all text-sm"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.medicalHistory.map((item, i) => (
                  <span key={i} className="bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-lg text-xs flex items-center gap-2">
                    {item} <FiX className="cursor-pointer" onClick={() => removeItem(i, 'medicalHistory')} />
                  </span>
                ))}
              </div>
            </div>

            {/* Tag Input for Allergies */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Allergies (Press Enter)</label>
              <input 
                type="text" value={allergyInput} onChange={(e) => setAllergyInput(e.target.value)}
                onKeyDown={(e) => handleAddItem(e, 'allergies')}
                placeholder="e.g. Peanuts, Penicillin"
                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-indigo-500 transition-all text-sm"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.allergies.map((item, i) => (
                  <span key={i} className="bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-lg text-xs flex items-center gap-2">
                    {item} <FiX className="cursor-pointer" onClick={() => removeItem(i, 'allergies')} />
                  </span>
                ))}
              </div>
            </div>

            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all mt-8">
              <FiPlus /> Complete Registration
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

const InputGroup = ({ label, icon, value, onChange, placeholder, type = "text", required = false }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">{label}</label>
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 text-sm">{icon}</div>
      <input 
        type={type} value={value} onChange={onChange} required={required} placeholder={placeholder}
        className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-indigo-500 transition-all text-sm"
      />
    </div>
  </div>
);

export default Register;