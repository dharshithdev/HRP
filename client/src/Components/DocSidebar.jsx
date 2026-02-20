import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHome, FiCalendar, FiSettings, FiLogOut, FiChevronRight, FiClock, FiMenu, FiX } from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ logout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { label: 'Dashboard', icon: <FiHome />, path: '/doctor-dashboard' },
    { label: 'Appointments', icon: <FiCalendar />, path: '/doctor/appointments' },
    { label: 'Schedule', icon: <FiClock />, path: '/doctor/schedule' },
    { label: 'Settings', icon: <FiSettings />, path: '/doctor/settings' },
  ];

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* MOBILE TOP BAR - Only visible on small screens */}
      <div className="lg:hidden w-full bg-[#060910] border-b border-white/5 p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex flex-col">
          <h1 className="text-xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent tracking-tighter">
            HRP
          </h1>
        </div>
        <button 
          onClick={toggleSidebar} 
          className="p-2 bg-white/5 rounded-xl text-indigo-400 active:scale-95 transition-transform"
        >
          {isOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>
      </div>

      {/* MOBILE OVERLAY */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[55] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* SIDEBAR ENTITY */}
      <motion.aside 
        initial={false}
        animate={{ 
          x: typeof window !== 'undefined' && window.innerWidth >= 1024 ? 0 : (isOpen ? 0 : -320) 
        }}
        transition={{ type: "spring", damping: 20, stiffness: 150 }}
        className={`fixed lg:sticky top-0 left-0 h-screen w-72 bg-[#060910] border-r border-white/10 flex flex-col p-6 z-[60] lg:translate-x-0 shadow-2xl lg:shadow-none`}
      >
        {/* Logo Section */}
        <div className="mb-12 px-2 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent tracking-tighter">
              HRP
            </h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Health Records Portal</p>
          </div>
          <button onClick={toggleSidebar} className="lg:hidden text-slate-500 p-2">
            <FiX size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <div
                key={item.label}
                onClick={() => {
                  navigate(item.path);
                  setIsOpen(false);
                }}
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
    </>
  );
};

export default Sidebar;