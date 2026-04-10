import React, { useState, useEffect, useContext } from 'react';
import { API_URL } from '../config';
import { Sidebar } from '../components/layout/Sidebar';
import { TopNav } from '../components/layout/TopNav';
import { AuthContext } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, Clock, Video, Phone, MessageSquare, CheckCircle } from 'lucide-react';

const DoctorProfile = () => {
  const { id } = useParams();
  const { token, logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Booking State
  const [bookingType, setBookingType] = useState('video');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00 AM');
  const [bookingStatus, setBookingStatus] = useState(null); // 'loading', 'success', 'error'

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await fetch(`${API_URL}/doctors/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setDoctor(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id, token]);

  const handleBookSession = async (e) => {
    e.preventDefault();
    if (!date) return alert("Please select a date");
    
    setBookingStatus('loading');
    try {
      const res = await fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ 
          doctorId: doctor.userId._id, 
          date, 
          timeSlot: time, 
          purpose: `${bookingType.toUpperCase()} Session` 
        })
      });
      
      if (res.ok) {
        setBookingStatus('success');
        setTimeout(() => navigate('/appointments'), 2000);
      } else {
        setBookingStatus('error');
      }
    } catch (err) {
      setBookingStatus('error');
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-dark-bg text-primary">Loading Profile...</div>;
  if (!doctor) return <div className="h-screen flex items-center justify-center bg-dark-bg text-red-500">Doctor not found.</div>;

  return (
    <div className="flex h-screen overflow-hidden bg-dark-bg">
      <Sidebar onLogout={logout} />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <TopNav title="Doctor Profile" />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 z-10 w-full flex justify-center">
          <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Col: Info */}
            <div className="lg:col-span-2 space-y-6">
               <div className="bg-dark-card border border-dark-border rounded-2xl p-8 flex flex-col md:flex-row gap-8 items-start relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl"></div>
                 
                 <div className="w-32 h-32 rounded-3xl bg-primary/20 text-primary flex justify-center items-center text-5xl font-bold shrink-0">
                    {doctor.userId?.name.charAt(0)}
                 </div>
                 
                 <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h1 className="text-3xl font-bold text-white mb-1">{doctor.userId?.name}</h1>
                        <p className="text-primary font-medium text-lg mb-4">{doctor.specialization}</p>
                      </div>
                      <div className="flex items-center gap-2 bg-yellow-500/10 text-yellow-500 px-3 py-1.5 rounded-lg font-bold">
                         <Star size={18} className="fill-yellow-500" /> {doctor.rating.toFixed(1)}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-gray-400 text-sm mb-6">
                       <span className="flex items-center gap-1"><Clock size={16}/> {doctor.experience} Years Exp.</span>
                       <span className="flex items-center gap-1"><CheckCircle size={16} className="text-green-500"/> {doctor.patientsTreated} Patients</span>
                       <span className="flex items-center gap-1"><MapPin size={16}/> {doctor.languages.join(', ')}</span>
                    </div>

                    <div className="border-t border-dark-border pt-4">
                      <h3 className="text-white font-bold mb-2">About</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">{doctor.bio || "This doctor has not provided a biography."}</p>
                    </div>
                 </div>
               </div>
            </div>

            {/* Right Col: Booking Widget */}
            <div className="lg:col-span-1">
              <div className="bg-dark-card border border-primary/20 rounded-2xl p-6 sticky top-8 shadow-[0_10px_40px_rgba(0,242,254,0.05)]">
                 <h2 className="text-xl font-bold text-white mb-2">Book a Session</h2>
                 <p className="text-gray-400 mb-6 text-sm">Consultation Fee: <span className="text-white font-bold text-lg">₹{doctor.pricing}</span></p>

                 <form onSubmit={handleBookSession} className="space-y-5">
                   
                   <div>
                     <label className="block text-sm font-medium text-gray-400 mb-2">Session Type</label>
                     <div className="grid grid-cols-3 gap-2">
                        {doctor.sessionPreferences?.video && <button type="button" onClick={() => setBookingType('video')} className={`p-2 flex flex-col items-center justify-center gap-1 rounded-xl border transition-all ${bookingType==='video' ? 'bg-primary/20 border-primary text-primary' : 'bg-dark-bg border-dark-border text-gray-500 hover:text-white'}`}><Video size={18}/> <span className="text-xs">Video</span></button>}
                        {doctor.sessionPreferences?.audio && <button type="button" onClick={() => setBookingType('audio')} className={`p-2 flex flex-col items-center justify-center gap-1 rounded-xl border transition-all ${bookingType==='audio' ? 'bg-primary/20 border-primary text-primary' : 'bg-dark-bg border-dark-border text-gray-500 hover:text-white'}`}><Phone size={18}/> <span className="text-xs">Audio</span></button>}
                        {doctor.sessionPreferences?.chat && <button type="button" onClick={() => setBookingType('chat')} className={`p-2 flex flex-col items-center justify-center gap-1 rounded-xl border transition-all ${bookingType==='chat' ? 'bg-primary/20 border-primary text-primary' : 'bg-dark-bg border-dark-border text-gray-500 hover:text-white'}`}><MessageSquare size={18}/> <span className="text-xs">Chat</span></button>}
                     </div>
                   </div>

                   <div>
                     <label className="block text-sm font-medium text-gray-400 mb-2">Select Date</label>
                     <input required type="date" min={new Date().toISOString().split('T')[0]} value={date} onChange={e=>setDate(e.target.value)} className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white focus:border-primary outline-none" />
                   </div>
                   
                   <div>
                     <label className="block text-sm font-medium text-gray-400 mb-2">Select Time</label>
                     <select value={time} onChange={e=>setTime(e.target.value)} className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white focus:border-primary outline-none">
                       {['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '04:00 PM'].map(t => <option key={t}>{t}</option>)}
                     </select>
                   </div>

                   <button disabled={bookingStatus === 'loading' || bookingStatus === 'success'} type="submit" className="w-full bg-primary hover:bg-primary/90 text-black font-bold py-3 rounded-lg transition-colors mt-4 disabled:opacity-50">
                     {bookingStatus === 'loading' ? 'Processing...' : bookingStatus === 'success' ? 'Booked Successfully!' : 'Confirm Booking'}
                   </button>
                   {bookingStatus === 'error' && <p className="text-red-500 text-sm text-center">Failed to book appointment.</p>}

                 </form>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};
export default DoctorProfile;
