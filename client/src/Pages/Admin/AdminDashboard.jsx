import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../Contexts/AuthFile';
import AdminSidebar from '../../Components/AdminSidebar';
import axios from 'axios';
import { FiUsers, FiActivity, FiAlertCircle, FiTrendingUp, FiLoader } from 'react-icons/fi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  const { logout } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/dashboard-stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#060910] flex items-center justify-center text-indigo-500">
      <FiLoader className="animate-spin text-4xl" />
    </div>
  );

  const statsCards = [
    { label: 'Total Users', value: data?.stats.totalUsers, icon: <FiUsers />, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Active Doctors', value: data?.stats.activeDoctors, icon: <FiActivity />, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Staff Members', value: data?.stats.staffCount, icon: <FiTrendingUp />, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { label: 'System Alerts', value: data?.stats.alerts, icon: <FiAlertCircle />, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ];

  return (
    /* Change 1: Added flex-col for mobile, flex-row for desktop */
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#060910] text-white">
      <AdminSidebar logout={logout} />

      {/* Change 2: Adjusted padding (p-5 on mobile, p-10 on desktop) */}
      <main className="flex-1 p-5 lg:p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-8 lg:mb-10">
          <div>
            {/* Change 3: Responsive text sizes */}
            <h2 className="text-2xl sm:text-4xl font-black italic tracking-tighter uppercase">Central Command</h2>
            <p className="text-slate-500 text-xs sm:text-base font-medium">Real-time system pulse</p>
          </div>
        </header>

        {/* STATS GRID: Already had md:grid-cols-2 lg:grid-cols-4, which is good! */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-10">
          {statsCards.map((stat, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={stat.label}
              /* Change 4: Adjusted rounding for mobile */
              className="bg-white/5 border border-white/5 p-5 lg:p-6 rounded-[1.5rem] lg:rounded-[2.5rem] hover:border-white/10 transition-all group"
            >
              <div className={`${stat.bg} ${stat.color} w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl flex items-center justify-center mb-4 text-lg lg:text-xl group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
              <p className="text-slate-500 text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em]">{stat.label}</p>
              <h3 className="text-2xl lg:text-3xl font-black mt-1 tracking-tight">{stat.value}</h3>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* DYNAMIC CHART */}
          <motion.div className="lg:col-span-2 bg-white/5 border border-white/5 p-5 lg:p-8 rounded-[2rem] lg:rounded-[3rem]">
            <h3 className="text-lg lg:text-xl font-bold mb-6 lg:mb-8 flex items-center gap-2">
              <span className="w-2 h-2 bg-indigo-500 rounded-full"></span> Appointment Traffic (7D)
            </h3>
            {/* Change 5: Shorter height for mobile charts */}
            <div className="h-[250px] lg:h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.chartData}>
                  <defs>
                    <linearGradient id="colorApp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  {/* Change 6: Hidden X-Axis labels on very small screens if needed, or rotate */}
                  <XAxis dataKey="_id" stroke="#475569" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={9} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '15px', fontSize: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
              <Area type="monotone"  dataKey="appointments"  stroke="#6366f1" strokeWidth={window.innerWidth < 768 ? 3 : 4} fillOpacity={1}  fill="url(#colorApp)" />                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* RECENT EVENTS */}
          <motion.div className="bg-white/5 border border-white/5 p-6 lg:p-8 rounded-[2rem] lg:rounded-[3rem]">
            <h3 className="text-lg lg:text-xl font-bold mb-6">System Events</h3>
            <div className="space-y-5 lg:space-y-6">
              {data?.recentActivity.map((log, i) => (
                <div key={i} className="flex gap-3 lg:gap-4 items-center group">
                  <div className={`w-1.5 h-1.5 lg:w-2 h-2 rounded-full ${log.color} group-hover:scale-150 transition-transform`} />
                  <div className="flex-1">
                    <p className="text-xs lg:text-sm font-bold group-hover:text-indigo-400 transition-colors">{log.user}</p>
                    <p className="text-[10px] lg:text-xs text-slate-500">{log.action}</p>
                  </div>
                  <span className="text-[9px] lg:text-[10px] font-mono text-slate-600">{log.time}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;