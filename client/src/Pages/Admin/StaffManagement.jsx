import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../Contexts/AuthFile';
import AdminSidebar from '../../Components/AdminSidebar';
import axios from 'axios';
import { FiUsers, FiSearch, FiPhone, FiMail, FiHash, FiClock, FiActivity, FiUser, FiTrash2, FiPower } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const StaffManagement = () => {
  const { logout } = useContext(AuthContext);
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/staff`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStaffList(res.data);
      if (res.data.length > 0 && !selectedStaff) setSelectedStaff(res.data[0]);
    } catch (err) {
      console.error("Error fetching staff", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // --- INTERACTION HANDLERS ---

  const handleToggleStatus = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${process.env.REACT_APP_API_URL}/api/admin/toggle-status/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state to reflect the toggle
      setStaffList(prev => prev.map(s => 
        s.userId._id === userId 
        ? { ...s, userId: { ...s.userId, isActive: !s.userId.isActive } } 
        : s
      ));
      
      // Update selected view
      setSelectedStaff(prev => ({
        ...prev,
        userId: { ...prev.userId, isActive: !prev.userId.isActive }
      }));
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleDelete = async (staffId, userId) => {
    if (!window.confirm("Are you sure? This will permanently remove this staff member and their account.")) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/admin/staff/${staffId}/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Remove from list and clear selection
      const updatedList = staffList.filter(s => s._id !== staffId);
      setStaffList(updatedList);
      setSelectedStaff(updatedList.length > 0 ? updatedList[0] : null);
    } catch (err) {
      alert("Failed to delete staff member");
    }
  };

  const filteredStaff = staffList.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.employeeId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-[#060910] text-white overflow-hidden">
      <AdminSidebar logout={logout} />

      <main className="flex-1 flex overflow-hidden">
        {/* LEFT SIDE: List of Staff */}
        <div className="w-1/3 border-r border-white/5 flex flex-col">
          <div className="p-8 pb-4">
            <h2 className="text-2xl font-black italic tracking-tighter uppercase mb-6">Staff Registry</h2>
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search by name or ID..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm focus:border-indigo-500 outline-none transition-all"
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {filteredStaff.map((staff) => (
              <button
                key={staff._id}
                onClick={() => setSelectedStaff(staff)}
                className={`w-full text-left p-4 rounded-2xl transition-all flex items-center gap-4 border ${
                  selectedStaff?._id === staff._id 
                  ? 'bg-indigo-600 border-indigo-400 shadow-lg shadow-indigo-600/20' 
                  : 'bg-white/5 border-transparent hover:bg-white/10'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                  selectedStaff?._id === staff._id ? 'bg-white/20 text-white' : 'bg-indigo-500/20 text-indigo-400'
                }`}>
                  {staff.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-sm">{staff.name}</p>
                  <p className={`text-[10px] uppercase tracking-widest font-black ${
                     selectedStaff?._id === staff._id ? 'text-indigo-200' : 'text-slate-500'
                  }`}>{staff.employeeId}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE: Detail View */}
        <div className="flex-1 bg-[#080d17] p-12 overflow-y-auto relative">
          <AnimatePresence mode="wait">
            {selectedStaff ? (
              <motion.div
                key={selectedStaff._id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-2xl mx-auto"
              >
                <div className="flex items-center gap-6 mb-12">
                   <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2.5rem] flex items-center justify-center text-4xl shadow-2xl shadow-indigo-500/20">
                     <FiUser />
                   </div>
                   <div>
                     <h3 className="text-4xl font-black italic tracking-tighter uppercase">{selectedStaff.name}</h3>
                     <div className="flex items-center gap-3 mt-2">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          selectedStaff.userId?.isActive 
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                          : 'bg-red-500/10 text-red-500 border-red-500/20'
                        }`}>
                          {selectedStaff.userId?.isActive ? 'Active Member' : 'Account Disabled'}
                        </span>
                        <span className="px-3 py-1 bg-white/5 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                          Role: Staff
                        </span>
                     </div>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <InfoCard icon={<FiHash />} label="Employee ID" value={selectedStaff.employeeId} />
                  <InfoCard icon={<FiActivity />} label="Department" value={selectedStaff.department} />
                  <InfoCard icon={<FiMail />} label="Email Address" value={selectedStaff.userId?.email} />
                  <InfoCard icon={<FiPhone />} label="Phone Number" value={selectedStaff.phone || "N/A"} />
                  <InfoCard icon={<FiClock />} label="Current Shift" value={selectedStaff.shift} />
                  <InfoCard icon={<FiUser />} label="Joined System" value={new Date(selectedStaff.createdAt).toLocaleDateString()} />
                </div>

                <div className="mt-12 pt-8 border-t border-white/5 flex gap-4">
                   <button className="px-8 py-4 bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-indigo-500 hover:text-white transition-all shadow-lg">
                     Edit Profile
                   </button>
                   
                   <button 
                    onClick={() => handleToggleStatus(selectedStaff.userId._id)}
                    className={`px-8 py-4 font-black text-[10px] uppercase tracking-widest rounded-2xl flex items-center gap-2 transition-all border ${
                      selectedStaff.userId?.isActive 
                      ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500 hover:text-white' 
                      : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500 hover:text-white'
                    }`}
                   >
                     <FiPower /> {selectedStaff.userId?.isActive ? 'Deactivate' : 'Reactivate'}
                   </button>

                   <button 
                    onClick={() => handleDelete(selectedStaff._id, selectedStaff.userId._id)}
                    className="px-8 py-4 bg-red-500/10 text-red-500 font-black text-[10px] uppercase tracking-widest rounded-2xl border border-red-500/20 hover:bg-red-500 hover:text-white transition-all flex items-center gap-2"
                   >
                     <FiTrash2 /> Permanent Delete
                   </button>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-20">
                <FiUsers size={64} className="mb-4" />
                <p className="font-black uppercase tracking-widest">Select a staff member to view details</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

const InfoCard = ({ icon, label, value }) => (
  <div className="bg-white/5 border border-white/5 p-6 rounded-[2rem] hover:border-white/10 transition-all">
    <div className="flex items-center gap-3 text-indigo-400 mb-2">
      {icon}
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</span>
    </div>
    <p className="text-lg font-bold">{value}</p>
  </div>
);

export default StaffManagement;