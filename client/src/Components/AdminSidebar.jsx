import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  FiGrid, 
  FiUsers, 
  FiSettings, 
  FiLogOut, 
  FiUserPlus,
  FiUser,
  FiCalendar,
  FiHeart
} from 'react-icons/fi';
import { RiAdminLine } from 'react-icons/ri';

const AdminSidebar = ({ logout }) => {
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', icon: <FiGrid />, path: '/admin/dashboard' },
    { name: 'Staff Management', icon: <FiUsers />, path: '/admin/staffs' },
    { name: 'Doctor Directory', icon: <FiUser />, path: '/admin/doctors' },
    { name: 'Create USer', icon: <FiUserPlus />, path: '/admin/create-user' },
    { name: 'Appointments', icon: <FiCalendar />, path: '/admin/adm-appointments' },
    { name: 'Patients', icon: <FiHeart />, path: '/admin/adm-patients' },
    { name: 'Settings', icon: <FiSettings />, path: '/admin/adm-settings'},
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-72 bg-[#0a0f1a] border-r border-white/5 flex flex-col h-screen sticky top-0">
      {/* Admin Branding */}
      <div className="p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <RiAdminLine className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-widest text-white uppercase">Admin</h1>
            <p className="text-[10px] text-indigo-400 font-bold tracking-tighter uppercase">Control Panel</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                  isActive 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40' 
                  : 'text-slate-500 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-xs font-black uppercase tracking-widest">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom Profile/Logout Section */}
      <div className="mt-auto p-8 border-t border-white/5">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all group"
        >
          <FiLogOut className="text-lg group-hover:translate-x-1 transition-transform" />
          <span className="text-xs font-black uppercase tracking-widest">Terminate Session</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;