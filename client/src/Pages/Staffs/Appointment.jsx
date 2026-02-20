import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../Contexts/AuthFile';
import StaffSidebar from '../../Components/StaffSidebar';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiCalendar, FiCheckCircle, FiAlertCircle, FiSearch, FiClock, FiArrowLeft, FiChevronRight } from 'react-icons/fi';

const BookAppointment = () => {
  const { logout } = useContext(AuthContext);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectableDates, setSelectableDates] = useState([]);

  const [booking, setBooking] = useState({
    patientId: null,
    patientName: '',
    doctorId: '',
    appointmentDate: '',
    timeSlot: ''
  });

  useEffect(() => {
    if (step === 1 && searchQuery.length > 2) {
      const delayDebounceFn = setTimeout(() => fetchPatients(), 300);
      return () => clearTimeout(delayDebounceFn);
    }
    if (step === 2) fetchDoctors();
  }, [step, searchQuery]);

  const fetchPatients = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/staff/patients/search?query=${searchQuery}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setPatients(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchDoctors = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/staff/doctor-records`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setDoctors(res.data);
    } catch (err) { console.error(err); }
  };

  const generateAvailableDates = (doctor) => {
    const dates = [];
    const today = new Date();
    const workingDays = doctor.availability.map(a => a.day);

    for (let i = 0; i < 14; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date);

      if (workingDays.includes(dayName)) {
        dates.push({
          fullDate: date.toISOString().split('T')[0],
          displayDay: dayName.substring(0, 3),
          displayDate: date.getDate(),
          displayMonth: date.toLocaleString('default', { month: 'short' })
        });
      }
    }
    setSelectableDates(dates);
  };

  const filterPassedSlots = (slots, selectedDate) => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (selectedDate !== todayStr) return slots;
    const currentTime = new Date();
    currentTime.setMinutes(currentTime.getMinutes() + 15); 
    return slots.filter(slot => {
      const [hours, minutes] = slot.split(':').map(Number);
      const slotTime = new Date();
      slotTime.setHours(hours, minutes, 0, 0);
      return slotTime > currentTime;
    });
  };

  const handleDoctorChange = (docId) => {
    const selectedDoc = doctors.find(d => d._id === docId);
    setBooking(prev => ({ ...prev, doctorId: docId, appointmentDate: '', timeSlot: '' }));
    setAvailableSlots([]);
    if (selectedDoc) generateAvailableDates(selectedDoc);
  };

  const handleDateSelect = async (dateString) => {
    setBooking(prev => ({ ...prev, appointmentDate: dateString, timeSlot: '' }));
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/staff/appointments/available-slots?doctorId=${booking.doctorId}&date=${dateString}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAvailableSlots(filterPassedSlots(res.data.availableSlots || [], dateString));
    } catch (err) {
      setAvailableSlots([]);
    } finally { setLoading(false); }
  };

  const handleBook = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/staff/appointments/book`, booking, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert("Success! Appointment Confirmed.");
      window.location.reload();
    } catch (err) { alert(err.response?.data?.message || "Booking failed"); }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#060910] text-white">
      <StaffSidebar logout={logout} />
      
      <main className="flex-1 p-6 lg:p-12 overflow-y-auto">
        <div className="max-w-4xl mx-auto w-full">
          <header className="mb-10 text-center lg:text-left">
            <h2 className="text-4xl lg:text-5xl font-black italic tracking-tighter uppercase">Scheduling</h2>
            <p className="text-slate-500 mt-2 text-sm">Assign patient slots to specialized medical staff</p>
            
            <div className="flex justify-center lg:justify-start gap-3 mt-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex flex-col gap-2">
                  <div className={`h-1.5 w-16 lg:w-24 rounded-full transition-all duration-700 ${step >= i ? 'bg-indigo-500' : 'bg-white/10'}`} />
                  <span className={`text-[9px] font-black uppercase tracking-widest ${step >= i ? 'text-indigo-400' : 'text-slate-600'}`}>Step 0{i}</span>
                </div>
              ))}
            </div>
          </header>

          <AnimatePresence mode="wait">
            {/* STEP 1: PATIENT SEARCH */}
            {step === 1 && (
              <motion.div 
                key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="bg-white/5 p-6 lg:p-10 rounded-[2.5rem] border border-white/5 backdrop-blur-sm"
              >
                <h3 className="text-lg font-black italic mb-8 flex items-center gap-3 uppercase tracking-tight">
                  <span className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400"><FiUser size={16}/></span>
                  01. Identification
                </h3>
                <div className="relative group mb-6">
                  <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                  <input 
                    type="text" placeholder="Search patient name or contact number..." 
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 pl-14 pr-6 outline-none focus:border-indigo-500/50 transition-all"
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="space-y-3 max-h-72 overflow-y-auto custom-scrollbar pr-2">
                  {patients.length > 0 ? patients.map(p => (
                    <button key={p._id} onClick={() => { setBooking({...booking, patientId: p._id, patientName: p.name}); setStep(2); }}
                      className="w-full p-5 bg-white/5 rounded-2xl border border-white/5 hover:border-indigo-500/50 hover:bg-white/[0.08] flex justify-between items-center transition-all group text-left">
                      <div>
                        <p className="font-bold text-white group-hover:text-indigo-400 transition-colors">{p.name}</p>
                        <p className="text-[10px] text-slate-500 font-black uppercase mt-1 tracking-widest">{p.contact}</p>
                      </div>
                      <FiChevronRight className="text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                    </button>
                  )) : searchQuery.length > 2 && <p className="text-center py-10 text-slate-600 text-xs font-bold uppercase tracking-widest">No patient records found</p>}
                </div>
              </motion.div>
            )}

            {/* STEP 2: DOCTOR & DATE SELECTION */}
            {step === 2 && (
              <motion.div 
                key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="bg-white/5 p-6 lg:p-10 rounded-[2.5rem] border border-white/5"
              >
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-lg font-black italic flex items-center gap-3 uppercase tracking-tight">
                    <span className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400"><FiCalendar size={16}/></span>
                    02. Schedule Parameters
                  </h3>
                  <button onClick={() => setStep(1)} className="text-slate-500 hover:text-white transition-colors"><FiArrowLeft size={20}/></button>
                </div>

                <div className="space-y-2 mb-8">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Select Medical Professional</label>
                  <select 
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-indigo-500 text-white font-bold appearance-none cursor-pointer"
                    onChange={(e) => handleDoctorChange(e.target.value)}
                    value={booking.doctorId}
                  >
                    <option value="">Select Specialist...</option>
                    {doctors.map(d => <option key={d._id} value={d._id} className="bg-[#060910]">Dr. {d.name} — {d.specialization}</option>)}
                  </select>
                </div>

                {booking.doctorId && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1 block mb-4">Availability Window</label>
                    <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar snap-x">
                      {selectableDates.map((dateObj) => (
                        <button
                          key={dateObj.fullDate}
                          onClick={() => handleDateSelect(dateObj.fullDate)}
                          className={`flex-shrink-0 w-20 h-24 rounded-2xl border flex flex-col items-center justify-center transition-all snap-start ${
                            booking.appointmentDate === dateObj.fullDate 
                            ? 'bg-indigo-600 border-indigo-400 shadow-xl shadow-indigo-900/40' 
                            : 'bg-black/40 border-white/5 hover:border-white/20'
                          }`}
                        >
                          <span className="text-[9px] font-black opacity-60 uppercase">{dateObj.displayDay}</span>
                          <span className="text-2xl font-black my-0.5">{dateObj.displayDate}</span>
                          <span className="text-[9px] font-black opacity-60 uppercase">{dateObj.displayMonth}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {booking.appointmentDate && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-4 border-t border-white/5">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1 block mb-6">Select Precision Slot</label>
                    {loading ? (
                      <div className="text-center py-10"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
                    ) : availableSlots.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {availableSlots.map(slot => (
                          <button 
                            key={slot} onClick={() => {setBooking({...booking, timeSlot: slot}); setStep(3);}}
                            className="py-4 rounded-xl bg-white/5 border border-white/5 hover:bg-indigo-600 hover:border-indigo-400 transition-all text-xs font-black font-mono flex items-center justify-center gap-2"
                          >
                            <FiClock className="opacity-40" /> {slot}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-3xl text-red-500 text-xs font-bold flex items-center gap-3">
                        <FiAlertCircle size={18} /> Fully Booked: No availability for this date.
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* STEP 3: FINAL CONFIRMATION */}
            {step === 3 && (
              <motion.div 
                key="step3" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="bg-indigo-600 p-8 lg:p-14 rounded-[3rem] text-center shadow-2xl relative overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-8 text-indigo-600 shadow-xl">
                    <FiCheckCircle size={40} />
                  </div>
                  <h3 className="text-3xl lg:text-4xl font-black mb-4 italic uppercase tracking-tighter text-white">Review Booking</h3>
                  
                  <div className="bg-black/20 p-8 rounded-[2rem] my-8 text-left space-y-4 border border-white/10 backdrop-blur-md">
                    <SummaryItem label="Patient" value={booking.patientName} />
                    <SummaryItem label="Consultant" value={`Dr. ${doctors.find(d => d._id === booking.doctorId)?.name}`} />
                    <SummaryItem label="Scheduled Date" value={new Date(booking.appointmentDate).toDateString()} />
                    <SummaryItem label="Time Slot" value={booking.timeSlot} />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={() => setStep(2)} className="flex-1 bg-white/10 hover:bg-white/20 py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all">Revise Details</button>
                    <button onClick={handleBook} className="flex-1 bg-white text-indigo-600 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] transition-all shadow-lg">Confirm & Dispatch</button>
                  </div>
                </div>
                {/* Decorative Elements */}
                <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-indigo-400/20 rounded-full blur-[100px]" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

// Helper Components
const SummaryItem = ({ label, value }) => (
  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 border-b border-white/5 pb-3">
    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200">{label}</span>
    <span className="font-bold text-white text-sm">{value}</span>
  </div>
);

export default BookAppointment;