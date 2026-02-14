import React from 'react';
import { motion } from 'framer-motion';
import { FiHome, FiCalendar, FiSettings, FiLogOut, FiChevronRight, FiClock } from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ logout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: 'Dashboard', icon: <FiHome />, path: '/doctor-dashboard' },
    { label: 'Appointments', icon: <FiCalendar />, path: '/doctor/appointments' },
    { label: 'Schedule', icon: <FiClock />, path: '/doctor/schedule' },
    { label: 'Settings', icon: <FiSettings />, path: '/doctor/settings' },
  ]; 

  return (
    <motion.aside 
      initial={{ x: -100 }}
      animate={{ x: 0 }}
      className="w-72 bg-white/5 border-r border-white/10 flex flex-col p-6 hidden lg:flex sticky top-0 h-screen"
    >
      {/* Logo Section */}
      <div className="mb-12 px-2">
        <h1 className="text-3xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent tracking-tighter">
          HRP
        </h1>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Health Records Portal</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <div
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-300 group ${
                isActive 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className={`text-xl ${isActive ? 'text-white' : 'group-hover:text-indigo-400'}`}>
                {item.icon}
              </span>
              <span className="font-semibold tracking-wide">{item.label}</span>
              {isActive && <FiChevronRight className="ml-auto" />}
            </div>
          );
        })}
      </nav>

      {/* Logout Button */}
      <button 
        onClick={logout}
        className="mt-auto flex items-center gap-4 p-4 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-2xl transition-all duration-300 group"
      >
        <FiLogOut className="text-xl group-hover:rotate-12 transition-transform" /> 
        <span className="font-bold uppercase text-xs tracking-widest">Logout Session</span>
      </button>
    </motion.aside>
  );
};

export default Sidebar;