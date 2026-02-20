import React, { useState, useContext } from 'react';
import { AuthContext } from '../../Contexts/AuthFile';
import AdminSidebar from '../../Components/AdminSidebar';
import axios from 'axios';
import { FiUserPlus, FiMail, FiLock, FiUser, FiBriefcase, FiHash, FiPhone, FiClock, FiShield } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const CreateUser = () => {
  const { logout } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'Staff',
    name: '',
    employeeId: '',
    department: 'Reception',
    shift: 'Morning',
    specialization: '',
    phone: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/register`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(res.data.message);
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#060910] text-white">
      <AdminSidebar logout={logout} />

      <main className="flex-1 p-4 sm:p-6 lg:p-10 flex justify-center items-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          /* Responsive padding and rounding */
          className="w-full max-w-2xl bg-white/5 border border-white/5 rounded-[2rem] lg:rounded-[3rem] p-6 sm:p-8 lg:p-12 shadow-2xl"
        >
          <div className="flex items-center gap-4 mb-8 lg:mb-10">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-indigo-600 rounded-xl lg:rounded-2xl flex items-center justify-center text-xl lg:text-2xl">
              <FiUserPlus />
            </div>
            <div>
              <h2 className="text-xl lg:text-3xl font-black italic uppercase tracking-tighter">Initialize User</h2>
              <p className="text-slate-500 text-xs lg:text-sm">Create a new secure access node</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 lg:space-y-6">
            {/* CORE FIELDS: Column on mobile, Grid on desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-6">
              <InputGroup icon={<FiMail />} label="Email Address">
                <input type="email" name="email" required onChange={handleChange} className="form-input text-sm" placeholder="name@hospital.com" />
              </InputGroup>
              <InputGroup icon={<FiLock />} label="Access Password">
                <input type="password" name="password" required onChange={handleChange} className="form-input text-sm" placeholder="••••••••" />
              </InputGroup>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-6">
              <InputGroup icon={<FiUser />} label="Full Name">
                <input type="text" name="name" required onChange={handleChange} className="form-input text-sm" placeholder="Name" />
              </InputGroup>
              <InputGroup icon={<FiShield />} label="System Role">
                <select name="role" value={formData.role} onChange={handleChange} className="form-input bg-[#0f172a] text-sm">
                  <option value="Staff">Staff Member</option>
                  <option value="Doctor">Doctor / Specialist</option>
                  <option value="Admin">System Administrator</option>
                </select>
              </InputGroup>
            </div>

            <hr className="border-white/5 my-6 lg:my-8" />

            {/* DYNAMIC ROLE-BASED FIELDS */}
            <AnimatePresence mode="wait">
              {formData.role === 'Staff' && (
                <motion.div key="staff" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-6">
                  <InputGroup icon={<FiHash />} label="Employee ID">
                    <input type="text" name="employeeId" required onChange={handleChange} className="form-input text-sm" placeholder="STF-101" />
                  </InputGroup>
                  <InputGroup icon={<FiClock />} label="Assigned Shift">
                    <select name="shift" onChange={handleChange} className="form-input bg-[#0f172a] text-sm">
                      <option value="Morning">Morning</option>
                      <option value="Evening">Evening</option>
                      <option value="Night">Night</option>
                    </select>
                  </InputGroup>
                </motion.div>
              )}

              {formData.role === 'Doctor' && (
                <motion.div key="doctor" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-6">
                  <InputGroup icon={<FiBriefcase />} label="Specialization">
                    <input type="text" name="specialization" required onChange={handleChange} className="form-input text-sm" placeholder="e.g. Cardiology" />
                  </InputGroup>
                  <InputGroup icon={<FiPhone />} label="Contact Number">
                    <input type="text" name="phone" required onChange={handleChange} className="form-input text-sm" placeholder="+1 234..." />
                  </InputGroup>
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-white text-black font-black py-4 rounded-xl lg:rounded-2xl uppercase tracking-[0.2em] text-[10px] lg:text-xs hover:bg-indigo-600 hover:text-white transition-all shadow-xl shadow-white/5 flex items-center justify-center gap-2 mt-4"
            >
              {loading ? "Processing..." : "Finalize Registration"}
            </button>
          </form>
        </motion.div>
      </main>
    </div>
  );
};

const InputGroup = ({ icon, label, children }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
      <span className="text-indigo-500">{icon}</span> {label}
    </label>
    {children}
  </div>
);

export default CreateUser;