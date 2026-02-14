import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../Contexts/AuthFile';
import AdminSidebar from '../../Components/AdminSidebar';
import axios from 'axios';
import { FiUsers, FiActivity, FiAlertCircle, FiTrendingUp, FiPlus, FiLoader } from 'react-icons/fi';
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
    <div className="flex min-h-screen bg-[#060910] text-white">
      <AdminSidebar logout={logout} />

      <main className="flex-1 p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-4xl font-black italic tracking-tighter uppercase">Central Command</h2>
            <p className="text-slate-500 font-medium">Real-time system pulse</p>
          </div>

        </header>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {statsCards.map((stat, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={stat.label}
              className="bg-white/5 border border-white/5 p-6 rounded-[2.5rem] hover:border-white/10 transition-all group"
            >
              <div className={`${stat.bg} ${stat.color} w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-xl group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">{stat.label}</p>
              <h3 className="text-3xl font-black mt-1 tracking-tight">{stat.value}</h3>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* DYNAMIC CHART */}
          <motion.div className="lg:col-span-2 bg-white/5 border border-white/5 p-8 rounded-[3rem]">
            <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
              <span className="w-2 h-2 bg-indigo-500 rounded-full"></span> Appointment Traffic (7D)
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.chartData}>
                  <defs>
                    <linearGradient id="colorApp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="_id" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '15px', fontSize: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="appointments" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorApp)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* RECENT EVENTS */}
          <motion.div className="bg-white/5 border border-white/5 p-8 rounded-[3rem]">
            <h3 className="text-xl font-bold mb-6">System Events</h3>
            <div className="space-y-6">
              {data?.recentActivity.map((log, i) => (
                <div key={i} className="flex gap-4 items-center group">
                  <div className={`w-2 h-2 rounded-full ${log.color} group-hover:scale-150 transition-transform`} />
                  <div className="flex-1">
                    <p className="text-sm font-bold group-hover:text-indigo-400 transition-colors">{log.user}</p>
                    <p className="text-xs text-slate-500">{log.action}</p>
                  </div>
                  <span className="text-[10px] font-mono text-slate-600">{log.time}</span>
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