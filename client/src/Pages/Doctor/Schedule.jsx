import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../Contexts/AuthFile';
import DoctorSidebar from '../../Components/DocSidebar';
import axios from 'axios';
import { FiPlus, FiTrash2, FiClock, FiCalendar, FiLock, FiSave } from 'react-icons/fi';

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
      await axios.put('${process.env.REACT_APP_API_URL}/api/doctor/update-schedule', { availability }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Weekly Schedule Published!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update");
    }
  };

  if (!isSunday) {
    return (
      <div className="flex min-h-screen bg-[#060910] text-white">
        <DoctorSidebar logout={logout} />
        <main className="flex-1 flex flex-col items-center justify-center p-10">
          <div className="bg-white/5 border border-white/10 p-12 rounded-[3rem] text-center max-w-md">
            <div className="w-20 h-20 bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiLock size={40} />
            </div>
            <h2 className="text-2xl font-black mb-4">Portal Locked</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Weekly schedule updates are only permitted on <span className="text-white font-bold">Sundays</span>. 
              Please return at the start of the week to set your availability.
            </p>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-600 bg-white/5 py-2 px-4 rounded-full inline-block">
              Current Day: {new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date())}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#060910] text-white">
      <DoctorSidebar logout={logout} />
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-black italic tracking-tighter uppercase">Weekly Planner</h2>
            <p className="text-emerald-500 text-xs font-bold mt-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              Sunday Update Window Active
            </p>
          </div>
          <button onClick={saveSchedule} className="bg-indigo-600 hover:bg-indigo-500 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2 transition-all shadow-xl shadow-indigo-600/20">
            <FiSave /> Publish Schedule
          </button>
        </header>

        <div className="space-y-6">
          {availability.map((item, dIdx) => (
            <div key={dIdx} className="bg-white/5 border border-white/5 p-8 rounded-[2.5rem] group relative">
              <div className="flex flex-wrap items-start gap-8">
                <div className="w-48">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">Day</label>
                  <select 
                    value={item.day} 
                    onChange={(e) => updateDay(dIdx, e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm focus:border-indigo-500 outline-none"
                  >
                    {daysOfWeek.map(d => <option key={d} value={d} className="bg-[#060910]">{d}</option>)}
                  </select>
                </div>

                <div className="flex-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">Time Slots</label>
                  <div className="flex flex-wrap gap-3">
                    {item.slots.map((slot, sIdx) => (
                      <div key={sIdx} className="flex items-center gap-2 bg-white/5 p-2 rounded-xl border border-white/10">
                        <input 
                          type="time" 
                          value={slot} 
                          onChange={(e) => updateSlot(dIdx, sIdx, e.target.value)}
                          className="bg-transparent text-xs font-bold outline-none"
                        />
                        <button onClick={() => removeSlot(dIdx, sIdx)} className="text-red-500 hover:text-red-400">
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    ))}
                    <button onClick={() => addSlot(dIdx)} className="p-2 border border-dashed border-white/20 rounded-xl text-slate-500 hover:text-indigo-400 hover:border-indigo-400/50 transition-all">
                      <FiPlus />
                    </button>
                  </div>
                </div>

                <button 
                  onClick={() => removeDayRow(dIdx)}
                  className="p-3 bg-red-500/10 text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}

          <button 
            onClick={addDayRow}
            className="w-full py-10 border-2 border-dashed border-white/5 rounded-[2.5rem] text-slate-500 hover:text-indigo-400 hover:bg-white/5 hover:border-indigo-500/20 transition-all flex flex-col items-center justify-center gap-2"
          >
            <FiCalendar size={24} />
            <span className="text-xs font-black uppercase tracking-widest">Add Another Work Day</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default Schedule;