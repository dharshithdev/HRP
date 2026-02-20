import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../Contexts/AuthFile';
import StaffSidebar from '../../Components/StaffSidebar';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiHash, FiDroplet, FiPhone, FiAlertCircle, FiPlus, FiX, FiCheckCircle, FiInfo, FiMenu } from 'react-icons/fi';

const Register = () => {
  const { logout } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '', age: '', gender: 'Male', bloodGroup: '', contact: '', medicalHistory: [], allergies: []
  });

  const [historyInput, setHistoryInput] = useState("");
  const [allergyInput, setAllergyInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // For mobile menu

  useEffect(() => {
    if (status.msg) {
      const timer = setTimeout(() => setStatus({ type: '', msg: '' }), 5000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleAddItem = (e, field) => {
    if (e.key === 'Enter' && e.target.value.trim() !== "") {
      e.preventDefault();
      if (!formData[field].includes(e.target.value.trim())) {
        setFormData({ ...formData, [field]: [...formData[field], e.target.value.trim()] });
      }
      field === 'medicalHistory' ? setHistoryInput("") : setAllergyInput("");
    }
  };

  const removeItem = (index, field) => {
    setFormData({ ...formData, [field]: formData[field].filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${process.env.REACT_APP_API_URL}/api/staff/register`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStatus({ type: 'success', msg: 'Patient profile established successfully.' });
      setFormData({ name: '', age: '', gender: 'Male', bloodGroup: '', contact: '', medicalHistory: [], allergies: [] });
    } catch (err) {
      setStatus({ type: 'error', msg: err.response?.data?.error || 'Registration failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#060910] text-white">
      {/* Sidebar - Pass isOpen and toggle for mobile responsiveness */}
      <StaffSidebar logout={logout} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className="flex-1 w-full overflow-x-hidden">

        <div className="p-6 lg:p-12 max-w-7xl mx-auto">
          <header className="mb-10 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
              <FiPlus className="text-indigo-500 text-xs" />
              <h2 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em]">Database Entry</h2>
            </div>
            <h1 className="text-4xl lg:text-6xl font-black italic tracking-tighter uppercase leading-none">Patient Intake</h1>
            <p className="text-slate-500 mt-4 max-w-xl mx-auto lg:mx-0 text-sm lg:text-base">
              Establish new digital medical records. Verify all clinical identifiers before commit.
            </p>
          </header>

          <AnimatePresence>
            {status.msg && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className={`mb-8 p-4 lg:p-5 rounded-2xl flex items-center justify-between border backdrop-blur-md ${
                  status.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                }`}
              >
                <div className="flex items-center gap-3 font-bold text-xs lg:text-sm">
                  {status.type === 'success' ? <FiCheckCircle /> : <FiInfo />} {status.msg}
                </div>
                <FiX className="cursor-pointer" onClick={() => setStatus({ type: '', msg: '' })} />
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-10">
            
            {/* Section 1: Basic Info */}
            <div className="bg-white/5 p-6 lg:p-10 rounded-[2rem] lg:rounded-[3rem] border border-white/5 space-y-6 lg:space-y-8">
              <h3 className="text-lg font-black italic uppercase text-white flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400"><FiUser size={16} /></div>
                Identity Parameters
              </h3>
              
              <InputGroup label="Full Legal Name" icon={<FiUser />} value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Patient Name" required />
              
              <div className="grid grid-cols-2 gap-4 lg:gap-6">
                <InputGroup label="Age" type="number" icon={<FiHash />} value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} placeholder="00" />
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Gender</label>
                  <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl lg:rounded-2xl py-3.5 lg:py-4 px-4 outline-none focus:border-indigo-500 transition-all text-sm font-bold appearance-none cursor-pointer"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                <InputGroup label="Blood Type" icon={<FiDroplet />} value={formData.bloodGroup} onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})} placeholder="e.g. AB+" />
                <InputGroup label="Primary Contact" icon={<FiPhone />} value={formData.contact} onChange={(e) => setFormData({...formData, contact: e.target.value})} placeholder="+1 (000) 000-0000" required />
              </div>
            </div>

            {/* Section 2: Clinical Context */}
            <div className="bg-white/5 p-6 lg:p-10 rounded-[2rem] lg:rounded-[3rem] border border-white/5 flex flex-col justify-between space-y-8">
              <div className="space-y-6 lg:space-y-8">
                <h3 className="text-lg font-black italic uppercase text-white flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500"><FiAlertCircle size={16} /></div>
                  Clinical Context
                </h3>
                
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Pre-existing Conditions</label>
                  <input type="text" value={historyInput} onChange={(e) => setHistoryInput(e.target.value)} onKeyDown={(e) => handleAddItem(e, 'medicalHistory')}
                    placeholder="Hit Enter to add..." className="w-full bg-black/40 border border-white/10 rounded-xl lg:rounded-2xl py-4 px-5 outline-none focus:border-indigo-500 text-sm"
                  />
                  <div className="flex flex-wrap gap-2">
                    {formData.medicalHistory.map((item, i) => (
                      <span key={i} className="bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 px-3 lg:px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2">
                        {item} <FiX className="cursor-pointer" onClick={() => removeItem(i, 'medicalHistory')} />
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Critical Allergies</label>
                  <input type="text" value={allergyInput} onChange={(e) => setAllergyInput(e.target.value)} onKeyDown={(e) => handleAddItem(e, 'allergies')}
                    placeholder="Hit Enter to add..." className="w-full bg-black/40 border border-white/10 rounded-xl lg:rounded-2xl py-4 px-5 outline-none focus:border-red-500/50 text-sm"
                  />
                  <div className="flex flex-wrap gap-2">
                    {formData.allergies.map((item, i) => (
                      <span key={i} className="bg-red-500/10 text-red-400 border border-red-500/20 px-3 lg:px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2">
                        {item} <FiX className="cursor-pointer" onClick={() => removeItem(i, 'allergies')} />
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button disabled={isSubmitting} type="submit" 
                className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] lg:text-xs flex items-center justify-center gap-3 transition-all shadow-2xl active:scale-95 ${
                  isSubmitting ? 'bg-slate-800 text-slate-600' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/30'
                }`}
              >
                {isSubmitting ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <><FiPlus /> Commit to Database</>}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

// Simplified and Responsive Input Component
const InputGroup = ({ label, icon, value, onChange, placeholder, type = "text", required = false }) => (
  <div className="space-y-2 group">
    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1 group-focus-within:text-indigo-400 transition-colors">{label}</label>
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500/40 group-focus-within:text-indigo-400 transition-colors">{icon}</div>
      <input type={type} value={value} onChange={onChange} required={required} placeholder={placeholder}
        className="w-full bg-black/40 border border-white/10 rounded-xl lg:rounded-2xl py-3.5 lg:py-4 pl-12 pr-4 outline-none focus:border-indigo-500/50 transition-all text-sm font-medium"
      />
    </div>
  </div>
);

export default Register;