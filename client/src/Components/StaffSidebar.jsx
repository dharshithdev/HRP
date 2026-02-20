import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FiGrid, FiUsers, FiClipboard, FiLogOut, FiActivity, FiMenu, FiX 
} from 'react-icons/fi';
import { FaUserMd } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const StaffSidebar = ({ logout }) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', icon: <FiGrid />, path: '/staff/dashboard' },
    { name: 'Patient Records', icon: <FiUsers />, path: '/staff/patient-records' },
    { name: 'Doctor Records', icon: <FaUserMd />, path: '/staff/doctor-records' },
    { name: 'Appointments', icon: <FiClipboard />, path: '/staff/all-appointments' },
  ];

  return (
    <>
      {/* 1. MOBILE TOP BAR - Visible ONLY on small screens */}
      <div className="lg:hidden w-full bg-[#0b0f1a] border-b border-white/5 p-4 flex justify-between items-center sticky top-0 z-[100]">
        <div className="flex items-center gap-2">
          <FiActivity className="text-indigo-500 text-xl" />
          <h1 className="text-lg font-black italic tracking-tighter text-white">HRP STAFF</h1>
        </div>
        <button 
          onClick={() => setIsOpen(true)} 
          className="p-2 bg-indigo-600/10 rounded-xl text-indigo-400"
        >
          <FiMenu size={20} />
        </button>
      </div>

      {/* 2. MOBILE OVERLAY */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[110] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* 3. THE SIDEBAR */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-[120] w-72 bg-[#0b0f1a] border-r border-white/5 flex flex-col transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 lg:static lg:h-screen
        `}
      >
        <div className="p-8 flex-1">
          {/* Logo & Close Button Header */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/40">
                <FiActivity className="text-white text-xl" />
              </div>
              <h1 className="text-xl font-black tracking-tighter italic text-white">HRP STAFF</h1>
            </div>
            
            {/* CLOSE BUTTON - Visible ONLY on Mobile */}
            <button 
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-2 text-slate-500 hover:text-white"
            >
              <FiX size={24} />
            </button>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)} // Closes menu on mobile after clicking
                className={({ isActive }) => 
                  `flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all ${
                    isActive 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
                    : 'text-slate-500 hover:bg-white/5 hover:text-slate-200'
                  }`
                }
              >
                <span className="text-lg">{item.icon}</span>
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="p-8">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-red-400 hover:bg-red-500/10 transition-all"
          >
            <FiLogOut className="text-lg" /> Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default StaffSidebar;