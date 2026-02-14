import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FiGrid, FiUsers, FiClipboard, FiPlusSquare, FiLogOut, FiActivity 
} from 'react-icons/fi';
import { FaUserMd } from 'react-icons/fa';

const StaffSidebar = ({ logout }) => {
  const menuItems = [
    { name: 'Dashboard', icon: <FiGrid />, path: '/staff/dashboard' },
    { name: 'Patient Records', icon: <FiUsers />, path: '/staff/patient-records' },
    { name: 'Doctor Records', icon: <FaUserMd />, path: '/staff/doctor-records' },
    { name: 'Appointments', icon: <FiClipboard />, path: '/staff/all-appointments' },
  ];

  return (
    <div className="w-72 bg-[#0b0f1a] border-r border-white/5 flex flex-col h-screen sticky top-0">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/40">
            <FiActivity className="text-white text-xl" />
          </div>
          <h1 className="text-xl font-black tracking-tighter italic">HRP STAFF</h1>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
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

      <div className="mt-auto p-8">
        <button 
          onClick={logout}
          className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-red-400 hover:bg-red-500/10 transition-all"
        >
          <FiLogOut className="text-lg" /> Logout
        </button>
      </div>
    </div>
  );
};

export default StaffSidebar;