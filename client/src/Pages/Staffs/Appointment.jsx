import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../Contexts/AuthFile';
import StaffSidebar from '../../Components/StaffSidebar';
import axios from 'axios';
import { FiUser, FiCalendar, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

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
    if (step === 1 && searchQuery.length > 2) fetchPatients();
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

  /**
   * NEW: Helper to filter out slots that have already passed if the date is today.
   */
  const filterPassedSlots = (slots, selectedDate) => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    // If the selected date is not today, all slots are valid
    if (selectedDate !== todayStr) return slots;

    const currentTime = new Date();
    // Setting a buffer (e.g., you can't book a slot starting in the next 15 mins)
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
      
      // Filter slots logic applied here
      const allSlots = res.data.availableSlots || [];
      const validSlots = filterPassedSlots(allSlots, dateString);
      
      setAvailableSlots(validSlots);
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

        {/* STEP 1: PATIENT SEARCH */}
        {step === 1 && (
          <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 animate-in fade-in zoom-in duration-300">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-indigo-400"><FiUser /> 01. Select Patient</h3>
            <input 
              type="text" placeholder="Search name or contact..." 
              className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 mb-6 outline-none focus:border-indigo-500"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
              {patients.map(p => (
                <div key={p._id} onClick={() => { setBooking({...booking, patientId: p._id, patientName: p.name}); setStep(2); }}
                  className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-indigo-500 cursor-pointer flex justify-between items-center transition-all group">
                  <span className="font-bold group-hover:text-indigo-400">{p.name}</span>
                  <span className="text-xs text-slate-500 font-mono">{p.contact}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: DOCTOR & DATE SELECTION */}
        {step === 2 && (
          <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 animate-in fade-in slide-in-from-right duration-500">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-indigo-400"><FiCalendar /> 02. Specialist & Date</h3>
            
            <select 
              className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 mb-8 outline-none focus:border-indigo-500 text-white"
              onChange={(e) => handleDoctorChange(e.target.value)}
              value={booking.doctorId}
            >
              <option value="">Choose a Doctor...</option>
              {doctors.map(d => <option key={d._id} value={d._id} className="bg-[#060910]">Dr. {d.name} ({d.specialization})</option>)}
            </select>

            {booking.doctorId && (
              <div className="mb-8">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 block mb-4">Available Dates</label>
                <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar">
                  {selectableDates.map((dateObj) => (
                    <button
                      key={dateObj.fullDate}
                      onClick={() => handleDateSelect(dateObj.fullDate)}
                      className={`flex-shrink-0 w-20 h-24 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                        booking.appointmentDate === dateObj.fullDate 
                        ? 'bg-indigo-600 border-indigo-400 shadow-lg shadow-indigo-900/40' 
                        : 'bg-white/5 border-white/10 hover:border-white/30'
                      }`}
                    >
                      <span className="text-[10px] font-bold opacity-60 uppercase">{dateObj.displayDay}</span>
                      <span className="text-2xl font-black">{dateObj.displayDate}</span>
                      <span className="text-[10px] font-bold opacity-60 uppercase">{dateObj.displayMonth}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {booking.appointmentDate && (
              <div className="animate-in fade-in slide-in-from-bottom duration-500">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 block mb-4">Select Time Slot</label>
                {loading ? (
                  <div className="text-center py-4 text-indigo-400 animate-pulse">Filtering slots...</div>
                ) : availableSlots.length > 0 ? (
                  <div className="grid grid-cols-3 gap-3">
                    {availableSlots.map(slot => (
                      <button 
                        key={slot} onClick={() => {setBooking({...booking, timeSlot: slot}); setStep(3);}}
                        className="py-3 rounded-xl bg-indigo-600/10 border border-indigo-500/20 hover:bg-indigo-600 transition-all text-xs font-bold"
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm flex items-center gap-2">
                    <FiAlertCircle /> No further slots available on this day.
                  </div>
                )}
              </div>
            )}
            <button onClick={() => setStep(1)} className="mt-8 text-slate-500 text-xs font-bold uppercase tracking-widest hover:text-white transition-all">← Back</button>
          </div>
        )}

        {/* STEP 3: FINAL CONFIRMATION */}
        {step === 3 && (
          <div className="bg-indigo-600 p-10 rounded-[3rem] text-center shadow-2xl relative overflow-hidden animate-in zoom-in duration-300">
            <div className="relative z-10">
              <FiCheckCircle className="text-7xl mx-auto mb-6 text-white" />
              <h3 className="text-3xl font-black mb-2 italic">Ready to Book?</h3>
              <div className="bg-black/20 p-6 rounded-3xl my-8 text-left space-y-3 border border-white/10 backdrop-blur-md">
                <p className="flex justify-between text-sm"><span className="opacity-50">Patient:</span> <b>{booking.patientName}</b></p>
                <p className="flex justify-between text-sm"><span className="opacity-50">Doctor:</span> <b>Dr. {doctors.find(d => d._id === booking.doctorId)?.name}</b></p>
                <p className="flex justify-between text-sm"><span className="opacity-50">Date:</span> <b>{booking.appointmentDate}</b></p>
                <p className="flex justify-between text-sm"><span className="opacity-50">Time:</span> <b>{booking.timeSlot}</b></p>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setStep(2)} className="flex-1 bg-black/20 py-4 rounded-2xl font-bold">Edit</button>
                <button onClick={handleBook} className="flex-1 bg-white text-indigo-600 py-4 rounded-2xl font-black hover:scale-105 transition-all">Finalize</button>
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