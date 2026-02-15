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
    // Staff Specific
    employeeId: '',
    department: 'Reception',
    shift: 'Morning',
    // Doctor Specific
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
      // Reset form logic here if desired
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#060910] text-white">
      <AdminSidebar logout={logout} />

      <main className="flex-1 p-10 flex justify-center items-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl bg-white/5 border border-white/5 rounded-[3rem] p-12 shadow-2xl"
        >
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center text-2xl">
              <FiUserPlus />
            </div>
            <div>
              <h2 className="text-3xl font-black italic uppercase tracking-tighter">Initialize User</h2>
              <p className="text-slate-500 text-sm">Create a new secure access node</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* CORE FIELDS */}
            <div className="grid grid-cols-2 gap-6">
              <InputGroup icon={<FiMail />} label="Email Address">
                <input type="email" name="email" required onChange={handleChange} className="form-input" placeholder="name@hospital.com" />
              </InputGroup>
              <InputGroup icon={<FiLock />} label="Access Password">
                <input type="password" name="password" required onChange={handleChange} className="form-input" placeholder="••••••••" />
              </InputGroup>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <InputGroup icon={<FiUser />} label="Full Name">
                <input type="text" name="name" required onChange={handleChange} className="form-input" placeholder="Name" />
              </InputGroup>
              <InputGroup icon={<FiShield />} label="System Role">
                <select name="role" value={formData.role} onChange={handleChange} className="form-input bg-[#0f172a]">
                  <option value="Staff">Staff Member</option>
                  <option value="Doctor">Doctor / Specialist</option>
                  <option value="Admin">System Administrator</option>
                </select>
              </InputGroup>
            </div>

            <hr className="border-white/5 my-8" />

            {/* DYNAMIC ROLE-BASED FIELDS */}
            <AnimatePresence mode="wait">
              {formData.role === 'Staff' && (
                <motion.div key="staff" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-2 gap-6">
                  <InputGroup icon={<FiHash />} label="Employee ID">
                    <input type="text" name="employeeId" required onChange={handleChange} className="form-input" placeholder="STF-101" />
                  </InputGroup>
                  <InputGroup icon={<FiClock />} label="Assigned Shift">
                    <select name="shift" onChange={handleChange} className="form-input bg-[#0f172a]">
                      <option value="Morning">Morning</option>
                      <option value="Evening">Evening</option>
                      <option value="Night">Night</option>
                    </select>
                  </InputGroup>
                </motion.div>
              )}

              {formData.role === 'Doctor' && (
                <motion.div key="doctor" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-2 gap-6">
                  <InputGroup icon={<FiBriefcase />} label="Specialization">
                    <input type="text" name="specialization" required onChange={handleChange} className="form-input" placeholder="e.g. Cardiology" />
                  </InputGroup>
                  <InputGroup icon={<FiPhone />} label="Contact Number">
                    <input type="text" name="phone" required onChange={handleChange} className="form-input" placeholder="+1 234..." />
                  </InputGroup>
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-white text-black font-black py-4 rounded-2xl uppercase tracking-[0.2em] text-xs hover:bg-indigo-500 hover:text-white transition-all shadow-xl shadow-white/5 flex items-center justify-center gap-2"
            >
              {loading ? "Processing..." : "Finalize Registration"}
            </button>
          </form>
        </motion.div>
      </main>
    </div>
  );
};

// Helper Component for UI consistency
const InputGroup = ({ icon, label, children }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
      <span className="text-indigo-500">{icon}</span> {label}
    </label>
    {children}
  </div>
);

export default CreateUser;