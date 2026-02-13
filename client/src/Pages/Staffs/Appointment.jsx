import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../Contexts/AuthFile';
import StaffSidebar from '../../Components/StaffSidebar';
import axios from 'axios';
import { FiUser, FiSearch, FiCalendar, FiClock, FiCheckCircle, FiChevronRight, FiAlertCircle } from 'react-icons/fi';

const BookAppointment = () => {
  const { logout } = useContext(AuthContext);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Selection States
  const [searchQuery, setSearchQuery] = useState("");
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);

  // Form Final State
  const [booking, setBooking] = useState({
    patientId: null,
    patientName: '',
    doctorId: '',
    appointmentDate: '',
    timeSlot: ''
  });

  // Fetch data based on steps
  useEffect(() => {
    if (step === 1 && searchQuery.length > 2) {
      fetchPatients();
    }
    if (step === 2) {
      fetchDoctors();
    }
  }, [step, searchQuery]);

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/staff/patients/search?query=${searchQuery}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPatients(res.data);
    } catch (err) {
      console.error("Patient search failed", err);
    }
  };

  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/staff/doctor-records', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Doctors received:", res.data); // Debugging log
      setDoctors(res.data);
    } catch (err) {
      console.error("Doctor fetch failed", err);
    }
  };

  const getSlots = async (doctorId, date) => {
    if (!doctorId || !date) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/staff/appointments/available-slots?doctorId=${doctorId}&date=${date}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAvailableSlots(res.data.availableSlots || []);
    } catch (err) {
      console.error("Slot fetch failed", err);
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/staff/appointments/book', booking, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Success! Appointment Confirmed.");
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.message || "Booking failed");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#060910] text-white">
      <StaffSidebar logout={logout} />
      <main className="flex-1 p-10 max-w-4xl mx-auto overflow-y-auto">
        <header className="mb-10 text-center">
          <h2 className="text-4xl font-black italic tracking-tighter">SCHEDULING</h2>
          <div className="flex justify-center gap-4 mt-6">
             {[1,2,3].map(i => (
               <div key={i} className={`h-1 w-12 rounded-full transition-all duration-500 ${step >= i ? 'bg-indigo-500' : 'bg-white/10'}`} />
             ))}
          </div>
        </header>

        {/* STEP 1: SELECT PATIENT */}
        {step === 1 && (
          <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-indigo-400">
              <FiUser /> 01. Identify Patient
            </h3>
            <div className="relative mb-6">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="Type name or contact number..." 
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 focus:border-indigo-500 outline-none transition-all"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-2">
              {patients.length > 0 ? patients.map(p => (
                <div key={p._id} onClick={() => { setBooking({...booking, patientId: p._id, patientName: p.name}); setStep(2); }}
                  className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-indigo-500/50 hover:bg-indigo-500/5 cursor-pointer flex justify-between items-center transition-all group">
                  <span className="font-bold group-hover:text-indigo-400">{p.name}</span>
                  <span className="text-xs text-slate-500 font-mono">{p.contact}</span>
                </div>
              )) : searchQuery.length > 2 && <p className="text-center text-slate-600 text-sm italic">No patients found matching "{searchQuery}"</p>}
            </div>
          </div>
        )}

        {/* STEP 2: SELECT DOCTOR & DATE */}
        {step === 2 && (
          <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2 text-indigo-400">
                <FiCalendar /> 02. Schedule Details
              </h3>
              <p className="text-xs font-black text-slate-500">PATIENT: {booking.patientName.toUpperCase()}</p>
            </div>
            
            <div className="grid gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Assign Specialist</label>
                <select 
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-indigo-500 transition-all text-white"
                  value={booking.doctorId}
                  onChange={(e) => {
                    const docId = e.target.value;
                    setBooking(prev => ({ ...prev, doctorId: docId }));
                    if (booking.appointmentDate) getSlots(docId, booking.appointmentDate);
                  }}
                >
                  <option value="" className="bg-[#060910]">Select a Doctor...</option>
                  {doctors.map(d => (
                    <option key={d._id} value={d._id} className="bg-[#060910]">
                      Dr. {d.name} ({d.specialization})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Consultation Date</label>
                <input 
                  type="date" 
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-indigo-500 transition-all"
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => {
                    setBooking({...booking, appointmentDate: e.target.value});
                    getSlots(booking.doctorId, e.target.value);
                  }}
                />
              </div>

              {booking.appointmentDate && booking.doctorId && (
                <div className="mt-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 block mb-3">Select Available Time Slot</label>
                  {loading ? (
                    <div className="flex items-center gap-2 text-indigo-400 text-sm animate-pulse"><FiClock /> Checking availability...</div>
                  ) : availableSlots.length > 0 ? (
                    <div className="grid grid-cols-3 gap-3">
                      {availableSlots.map(slot => (
                        <button 
                          key={slot} onClick={() => {setBooking({...booking, timeSlot: slot}); setStep(3);}}
                          className="py-3 rounded-xl bg-indigo-600/10 border border-indigo-500/20 hover:bg-indigo-600 hover:text-white transition-all text-xs font-bold"
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm flex items-center gap-2">
                      <FiAlertCircle /> No slots found for this date.
                    </div>
                  )}
                </div>
              )}
            </div>
            <button onClick={() => setStep(1)} className="mt-8 text-slate-500 text-xs font-bold uppercase tracking-widest hover:text-white transition-all">← Back to Patient Search</button>
          </div>
        )}

        {/* STEP 3: CONFIRMATION */}
        {step === 3 && (
          <div className="bg-indigo-600 p-10 rounded-[3rem] text-center shadow-2xl shadow-indigo-900/40 relative overflow-hidden">
            <div className="relative z-10">
              <FiCheckCircle className="text-7xl mx-auto mb-6 text-white" />
              <h3 className="text-3xl font-black mb-2 italic">Confirm Booking?</h3>
              <div className="bg-black/20 p-6 rounded-3xl my-8 text-left space-y-3 border border-white/10">
                <p className="flex justify-between text-sm"><span className="opacity-50">Patient:</span> <b>{booking.patientName}</b></p>
                <p className="flex justify-between text-sm"><span className="opacity-50">Specialist:</span> <b>Dr. {doctors.find(d => d._id === booking.doctorId)?.name}</b></p>
                <p className="flex justify-between text-sm"><span className="opacity-50">Schedule:</span> <b>{booking.appointmentDate} @ {booking.timeSlot}</b></p>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setStep(2)} className="flex-1 bg-black/20 py-4 rounded-2xl font-bold hover:bg-black/30 transition-all">Edit Details</button>
                <button onClick={handleBook} className="flex-1 bg-white text-indigo-600 py-4 rounded-2xl font-black hover:scale-105 transition-all">Finalize Appointment</button>
              </div>
            </div>
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          </div>
        )}
      </main>
    </div>
  );
};

export default BookAppointment;