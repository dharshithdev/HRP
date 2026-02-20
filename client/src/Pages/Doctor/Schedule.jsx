import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../Contexts/AuthFile';
import Sidebar from '../../Components/DocSidebar';
import axios from 'axios';
import { FiPlus, FiTrash2, FiCalendar, FiLock, FiSave, FiRefreshCw } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const Schedule = () => {
  const { logout } = useContext(AuthContext);
  const [availability, setAvailability] = useState([]);
  const [isSunday, setIsSunday] = useState(false);
  const [loading, setLoading] = useState(true);

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  useEffect(() => {
    const checkDay = () => {
      const today = new Date().getDay();
      setIsSunday(today === 0); // 0 = Sunday
    };
    checkDay();
    fetchSchedule(); 
  }, []);

  const fetchSchedule = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/doctor/schedule`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAvailability(res.data || []);
    } catch (err) {
      console.error("Fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  const addDayRow = () => {
    setAvailability([...availability, { day: "Monday", slots: ["09:00", "10:00"] }]);
  };

  const removeDayRow = (index) => {
    const updated = availability.filter((_, i) => i !== index);
    setAvailability(updated);
  };

  const updateDay = (index, dayName) => {
    const updated = [...availability];
    updated[index].day = dayName;
    setAvailability(updated);
  };

  const addSlot = (dayIndex) => {
    const updated = [...availability];
    updated[dayIndex].slots.push("12:00");
    setAvailability(updated);
  };

  const updateSlot = (dayIndex, slotIndex, time) => {
    const updated = [...availability];
    updated[dayIndex].slots[slotIndex] = time;
    setAvailability(updated);
  };

  const removeSlot = (dayIndex, slotIndex) => {
    const updated = [...availability];
    updated[dayIndex].slots.splice(slotIndex, 1);
    setAvailability(updated);
  };

  const saveSchedule = async () => {
    try {
      const token = localStorage.getItem('token');
      // Corrected: Template literal for URL
      await axios.put(`${process.env.REACT_APP_API_URL}/api/doctor/update-schedule`, { availability }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Weekly Schedule Published Successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060910] flex items-center justify-center text-indigo-400">
        <div className="animate-spin mr-3"><FiRefreshCw /></div>
        <span className="font-black uppercase tracking-widest text-xs">Accessing Calendar...</span>
      </div>
    );
  }

  // LOCKED STATE (Not Sunday)
  if (!isSunday) {
    return (
      <div className="flex flex-col lg:flex-row min-h-screen bg-[#060910] text-white">
        <Sidebar logout={logout} />
        <main className="flex-1 flex flex-col items-center justify-center p-6 lg:p-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/5 border border-white/10 p-8 lg:p-12 rounded-[2.5rem] lg:rounded-[3rem] text-center max-w-md shadow-2xl"
          >
            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-amber-500/10 text-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-amber-500/20">
              <FiLock size={32} />
            </div>
            <h2 className="text-xl lg:text-2xl font-black uppercase italic tracking-tighter mb-4">Scheduling Locked</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              To maintain system stability, schedule modifications are restricted to <span className="text-indigo-400 font-bold">Sundays</span>. 
            </p>
            <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 bg-black/40 py-3 px-6 rounded-2xl border border-white/5">
              <FiCalendar className="text-indigo-500" /> Today: {new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date())}
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  // ACTIVE STATE (Sunday)
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#060910] text-white">
      <Sidebar logout={logout} />
      <main className="flex-1 p-5 sm:p-8 lg:p-12 overflow-y-auto custom-scrollbar">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
          <div>
            <h2 className="text-3xl lg:text-4xl font-black italic tracking-tighter uppercase">Weekly Planner</h2>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
              <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">Configuration Window Active</p>
            </div>
          </div>
          <button 
            onClick={saveSchedule} 
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
          >
            <FiSave size={18} /> Publish Changes
          </button>
        </header>

        <div className="space-y-6 lg:max-w-5xl">
          <AnimatePresence>
            {availability.map((item, dIdx) => (
              <motion.div 
                key={dIdx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white/5 border border-white/5 p-6 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] group relative hover:bg-white/[0.07] transition-all"
              >
                <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-10">
                  {/* Day Selection */}
                  <div className="w-full lg:w-48">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-3">Operating Day</label>
                    <div className="relative">
                      <select 
                        value={item.day} 
                        onChange={(e) => updateDay(dIdx, e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-sm font-bold focus:border-indigo-500 outline-none appearance-none cursor-pointer"
                      >
                        {daysOfWeek.map(d => <option key={d} value={d} className="bg-[#060910]">{d}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Slots Section */}
                  <div className="flex-1 w-full">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-3">Available Time Slots</label>
                    <div className="flex flex-wrap gap-2 lg:gap-3">
                      {item.slots.map((slot, sIdx) => (
                        <div key={sIdx} className="flex items-center gap-2 bg-indigo-500/10 p-2 lg:p-2.5 rounded-xl border border-indigo-500/20 group/slot hover:border-indigo-500/50 transition-all">
                          <input 
                            type="time" 
                            value={slot} 
                            onChange={(e) => updateSlot(dIdx, sIdx, e.target.value)}
                            className="bg-transparent text-xs font-black text-indigo-100 outline-none cursor-pointer"
                          />
                          <button 
                            onClick={() => removeSlot(dIdx, sIdx)} 
                            className="text-indigo-400 hover:text-red-500 transition-colors p-1"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      ))}
                      <button 
                        onClick={() => addSlot(dIdx)} 
                        className="h-10 px-4 border-2 border-dashed border-white/10 rounded-xl text-slate-500 hover:text-indigo-400 hover:border-indigo-400/50 hover:bg-indigo-400/5 transition-all flex items-center justify-center"
                      >
                        <FiPlus size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Desktop Remove Day Button */}
                  <button 
                    onClick={() => removeDayRow(dIdx)}
                    className="hidden lg:flex p-3 bg-red-500/10 text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                  >
                    <FiTrash2 />
                  </button>
                  
                  {/* Mobile Remove Day Button */}
                  <button 
                    onClick={() => removeDayRow(dIdx)}
                    className="lg:hidden w-full mt-4 py-3 bg-red-500/10 text-red-500 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    <FiTrash2 /> Delete {item.day} Schedule
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <button 
            onClick={addDayRow}
            className="w-full py-12 lg:py-16 border-2 border-dashed border-white/5 rounded-[2rem] lg:rounded-[2.5rem] text-slate-500 hover:text-indigo-400 hover:bg-white/5 hover:border-indigo-500/20 transition-all flex flex-col items-center justify-center gap-3 group"
          >
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-500/10 transition-all">
              <FiCalendar size={24} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Add Workday Configuration</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default Schedule;