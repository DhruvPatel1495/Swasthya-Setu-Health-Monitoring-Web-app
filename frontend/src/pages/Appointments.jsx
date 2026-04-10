import React, { useState, useEffect, useContext } from 'react';
import { API_URL } from '../config';
import { AuthContext } from '../context/AuthContext';
import { Calendar as CalendarIcon, Clock, CheckCircle, XCircle, ChevronRight, Plus, MapPin, Video } from 'lucide-react';
import { TableSkeleton, CardSkeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';

const Appointments = () => {
  const { token, user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showModal, setShowModal] = useState(false);
  const [formDate, setFormDate] = useState('');
  const [formTimeSlot, setFormTimeSlot] = useState('10:00 AM');
  const [formDoctorId, setFormDoctorId] = useState('');
  const [formPurpose, setFormPurpose] = useState('');

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/appointments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setAppointments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await fetch(`${API_URL}/appointments/doctors`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setDoctors(data);
        if(data.length > 0) setFormDoctorId(data[0]._id);
      }
    } catch(e) { console.error(e); }
  };

  useEffect(() => {
    fetchAppointments();
    if (user?.role === 'Patient') fetchDoctors();
  }, [token, user]);

  const handleBook = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ doctorId: formDoctorId, date: formDate, timeSlot: formTimeSlot, purpose: formPurpose })
      });
      if (res.ok) {
        setShowModal(false);
        fetchAppointments();
      } else {
        const err = await res.json();
        alert(err.message);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await fetch(`${API_URL}/appointments/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      fetchAppointments();
    } catch (e) { console.error(e); }
  };

  const filteredAppointments = appointments.filter(a => {
    const isPast = new Date(a.date) < new Date().setHours(0,0,0,0);
    if (activeTab === 'upcoming') return !isPast && a.status !== 'cancelled';
    return isPast || a.status === 'cancelled';
  }).sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Appointments</h2>
          <p className="text-gray-400">Manage your health consultations and availability.</p>
        </div>
        {user?.role === 'Patient' && (
          <button 
            onClick={() => setShowModal(true)} 
            className="bg-primary text-dark-bg px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary/90 flex items-center gap-2 shadow-lg transition-all hover:scale-105 active:scale-95"
          >
            <Plus size={18}/> Book New Session
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 gap-8">
        <button 
           onClick={() => setActiveTab('upcoming')}
           className={`pb-4 px-2 font-black uppercase tracking-widest text-[10px] transition-all relative ${activeTab === 'upcoming' ? 'text-primary' : 'text-gray-600 hover:text-gray-300'}`}
        >
           Upcoming
           {activeTab === 'upcoming' && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full shadow-lg"></div>}
        </button>
        <button 
           onClick={() => setActiveTab('history')}
           className={`pb-4 px-2 font-black uppercase tracking-widest text-[10px] transition-all relative ${activeTab === 'history' ? 'text-primary' : 'text-gray-600 hover:text-gray-300'}`}
        >
           History
           {activeTab === 'history' && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full shadow-lg"></div>}
        </button>
      </div>

      {loading ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CardSkeleton/><CardSkeleton/><CardSkeleton/>
         </div>
      ) : filteredAppointments.length === 0 ? (
         <div className="py-24 text-center glass-card border-white/10 rounded-[2.5rem]">
           <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/10">
              <CalendarIcon size={32} className="text-gray-600" />
           </div>
           <h3 className="text-xl font-bold text-white mb-2">{activeTab === 'upcoming' ? "No upcoming appointments" : "No history found"}</h3>
           <p className="text-gray-400 max-w-sm mx-auto">{activeTab === 'upcoming' ? "Your schedule is clear. Use the button above to book a new session." : "You haven't completed any sessions yet."}</p>
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAppointments.map(a => (
            <div key={a._id} className="glass-card p-6 flex flex-col group hover:border-primary/40 transition-all duration-500 hover:-translate-y-1 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-10 group-hover:bg-primary/10 transition-colors"></div>
               
               <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest bg-primary/5 px-3 py-1.5 rounded-full text-[10px] border border-primary/20">
                    <Clock size={12}/> {a.timeSlot}
                  </div>
                  <span className={`text-[10px] px-3 py-1 rounded-full uppercase tracking-widest font-black border ${
                    a.status === 'confirmed' ? 'bg-green-500/10 text-green-400 border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.1)]' : 
                    a.status === 'cancelled' ? 'bg-red-500/10 text-red-400 border-red-500/30' : 
                    a.status === 'completed' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                    'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                  }`}>
                    {a.status}
                  </span>
               </div>

               <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl font-bold text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-dark-bg transition-all duration-300">
                    {(user?.role === 'Doctor' ? a.patientId?.name : a.doctorId?.name)?.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-white font-black text-lg leading-tight">{user?.role === 'Doctor' ? a.patientId?.name : a.doctorId?.name}</h4>
                    <p className="text-xs text-gray-500 font-bold flex items-center gap-2"><CalendarIcon size={14}/> {new Date(a.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                  </div>
               </div>

               <div className="flex flex-col gap-3 py-5 border-y border-white/5 mb-8">
                  <div className="flex items-center gap-3 text-xs text-gray-400 font-medium">
                     <Video size={16} className="text-primary/70"/> 
                     <span>Video Consultation Pulse</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400 font-medium">
                     <MapPin size={16} className="text-primary/70"/> 
                     <span className="truncate uppercase tracking-widest">Digital Health Bridge</span>
                  </div>
               </div>
               
               <p className="text-sm font-medium text-gray-300 italic mb-8 flex-1 leading-relaxed ring-1 ring-white/5 p-3 rounded-xl bg-white/[0.01]">
                  "{a.purpose || 'General medical checkup and consultation'}"
               </p>
               
               <div className="mt-auto">
                 {a.status === 'pending' && user?.role === 'Doctor' && (
                   <div className="flex gap-3">
                     <button onClick={() => handleStatusUpdate(a._id, 'confirmed')} className="flex-1 bg-green-500 hover:bg-green-600 text-dark-bg py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] flex justify-center items-center gap-2 transition-all shadow-lg shadow-green-500/10">Accept</button>
                     <button onClick={() => handleStatusUpdate(a._id, 'cancelled')} className="flex-1 border border-red-500/30 hover:bg-red-500/10 text-red-400 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] flex justify-center items-center transition-all">Reject</button>
                   </div>
                 )}
                 {a.status === 'pending' && user?.role === 'Patient' && (
                   <button onClick={() => handleStatusUpdate(a._id, 'cancelled')} className="w-full border border-red-500/30 hover:bg-red-500/10 text-red-400 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 transition-all justify-center">Cancel Booking</button>
                 )}
                 {a.status === 'confirmed' && (
                    <button className="w-full bg-primary hover:bg-primary/90 text-dark-bg py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 transition-all justify-center shadow-lg group-hover:scale-[1.02] shadow-primary/10">
                       Go to Session Pulse <ChevronRight size={16}/>
                    </button>
                 )}
               </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Slider/Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-dark-bg/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4 animate-in fade-in duration-500">
           <div className="glass-card border-white/10 rounded-[3rem] w-full max-w-lg p-10 shadow-[0_0_100px_rgba(0,0,0,0.5)] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[120px] pointer-events-none group-hover:scale-110 transition-transform"></div>
              
              <div className="flex justify-between items-center mb-10">
                 <div>
                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter">New Pulse Session</h3>
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mt-1">Book your specialist</p>
                 </div>
                 <button onClick={() => setShowModal(false)} className="p-3 bg-white/5 rounded-2xl text-gray-500 hover:text-white hover:bg-white/10 transition-all"><XCircle size={24}/></button>
              </div>

              <form onSubmit={handleBook} className="space-y-8">
               <div className="group">
                 <label className="block text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-3 px-1">Specialist Provider</label>
                 <select required value={formDoctorId} onChange={e => setFormDoctorId(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-primary outline-none transition-all appearance-none cursor-pointer">
                   {doctors.map(d => <option key={d._id} value={d._id} className="bg-dark-card">{d.name}</option>)}
                 </select>
               </div>
               <div className="grid grid-cols-2 gap-6">
                 <div>
                   <label className="block text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-3 px-1">Session Date</label>
                   <input required type="date" value={formDate} onChange={e => setFormDate(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-primary outline-none transition-all color-scheme-dark" min={new Date().toISOString().split('T')[0]} />
                 </div>
                 <div>
                   <label className="block text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-3 px-1">Session Time</label>
                   <select required value={formTimeSlot} onChange={e => setFormTimeSlot(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-primary outline-none transition-all appearance-none cursor-pointer">
                     {['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'].map(t => <option key={t} className="bg-dark-card">{t}</option>)}
                   </select>
                 </div>
               </div>
               <div>
                 <label className="block text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-3 px-1">Reason for Session</label>
                 <textarea rows="3" value={formPurpose} onChange={e => setFormPurpose(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-primary outline-none transition-all resize-none shadow-inner" placeholder="Briefly describe your symptoms..." />
               </div>
               
               <div className="pt-4">
                 <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-dark-bg font-black uppercase tracking-widest text-xs py-5 rounded-2xl transition-all shadow-xl shadow-primary/10 hover:scale-[1.02] active:scale-95">Complete Booking Pulse</button>
               </div>
             </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
