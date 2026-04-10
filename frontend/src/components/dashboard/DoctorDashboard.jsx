import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config';
import { StatsCard } from '../common/StatsCard';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Activity, Users, Calendar as CalendarIcon, Clock, AlertTriangle, ArrowRight, UserPlus, FileText, Search, MessageSquare, CheckCircle, Star } from 'lucide-react';
import { TableSkeleton, CardSkeleton } from '../common/Skeleton';
import { EmptyState } from '../common/EmptyState';
import { VitalsChart } from './VitalsChart';
import { CalendarWidget } from './CalendarWidget';
import { RecentSessions } from './RecentSessions';

export const DoctorDashboard = ({ user, token, socket }) => {
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [vitalsData, setVitalsData] = useState([]);
  const [patientSearch, setPatientSearch] = useState("");
  const [timeLeft, setTimeLeft] = useState('1d 18h 45m 57s');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsRes, statsRes, appointmentsRes] = await Promise.all([
          fetch(`${API_URL}/patient`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/appointments/stats`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/appointments`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        
        const patientsData = await patientsRes.json();
        const statsData = await statsRes.json();
        const appointmentsData = await appointmentsRes.json();

        setPatients(patientsData);
        setStats(statsData);
        setAppointments(appointmentsData);
        
        if (patientsData.length > 0) setSelectedPatient(patientsData[0]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    const interval = setInterval(() => {
       setTimeLeft(prev => {
          const parts = prev.match(/\d+/g);
          let [d, h, m, s] = parts.map(Number);
          if (s > 0) s--;
          else if (m > 0) { m--; s = 59; }
          else if (h > 0) { h--; m = 59; s = 59; }
          else if (d > 0) { d--; h = 23; m = 59; s = 59; }
          return `${d}d ${h}h ${m}m ${s}s`;
       });
    }, 1000);
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    if (!socket || !selectedPatient) return;
    const patientId = selectedPatient.userId._id;
    socket.on(`vitals-${patientId}`, (data) => {
       const timeStr = new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
       setVitalsData(prev => [...prev.slice(-15), { time: timeStr, heartRate: data.heartRate, spo2: data.spo2 }]);
    });
    return () => socket.off(`vitals-${patientId}`);
  }, [socket, selectedPatient]);

  const filteredPatients = patients.filter(p => p.userId?.name.toLowerCase().includes(patientSearch.toLowerCase()));

  if (loading) {
     return <div className="space-y-6"><div className="grid grid-cols-4 gap-4"><CardSkeleton/><CardSkeleton/><CardSkeleton/><CardSkeleton/></div><TableSkeleton rows={10}/></div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column */}
      <div className="lg:col-span-2 space-y-8">
        
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <StatsCard title="Sessions Delivered" value={stats?.attended || 2} icon={CheckCircle} color="success" />
          <StatsCard title="Upcoming Sessions" value={stats?.upcoming || 6} icon={CalendarIcon} color="primary" />
          <StatsCard title="Session Duration" value="3h 35min" icon={Clock} color="accent" />
          <StatsCard title="Unread Messages" value="5" icon={MessageSquare} color="warning" />
        </div>

        {/* Upcoming Session */}
        <div className="space-y-4">
           <h2 className="text-xl font-bold text-white tracking-tight px-1">Next Scheduled Session</h2>
           <div className="glass-card p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -z-10 group-hover:scale-110 transition-transform"></div>
              <div className="space-y-4 text-center md:text-left">
                 <p className="text-sm font-medium text-gray-400">
                    Next Voice Session with <span className="text-accent font-bold">Rakesh Chaudhary</span> on <br />
                    <span className="text-white font-bold">Depression Treatment</span>
                 </p>
                 <div className="text-4xl md:text-5xl font-extrabold text-white tracking-tighter">
                    {timeLeft}
                 </div>
              </div>
              <div className="flex flex-col gap-3 w-full md:w-auto">
                 <button className="px-8 py-3 bg-accent text-white font-bold rounded-2xl shadow-xl hover:scale-105 transition-all">Start Session</button>
                 <button className="px-8 py-3 bg-white/5 border border-white/10 text-gray-300 font-bold rounded-2xl hover:bg-white/10 transition-all">Change Date / Time</button>
              </div>
           </div>
        </div>

        {/* Monitoring & Patient Directory */}
        <div className="space-y-6">
           <div className="flex justify-between items-end border-b border-white/5 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2 tracking-tight"><Activity className="text-primary"/> Patient Monitoring</h2>
                <p className="text-xs text-gray-500 mt-1">Real-time vitals for {selectedPatient?.userId.name}</p>
              </div>
              <div className="flex gap-4">
                 <div className="text-right">
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Heart Rate</p>
                    <p className="text-lg font-bold text-red-500">{vitalsData[vitalsData.length-1]?.heartRate || '--'} <span className="text-[10px]">BPM</span></p>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] text-gray-500 uppercase font-bold">SpO2</p>
                    <p className="text-lg font-bold text-primary">{vitalsData[vitalsData.length-1]?.spo2 || '--'} <span className="text-[10px]">%</span></p>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <VitalsChart data={vitalsData} dataKey="heartRate" color="#ef4444" title="Selected Patient Heart Rate" unit="bpm" />
              <VitalsChart data={vitalsData} dataKey="spo2" color="#3b82f6" title="Selected Patient SpO2" unit="%" />
           </div>

           <div className="space-y-4 pt-4">
              <div className="flex justify-between items-center">
                 <h3 className="text-lg font-bold text-white">Patients Directory</h3>
                 <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14}/>
                    <input type="text" value={patientSearch} onChange={e=>setPatientSearch(e.target.value)} placeholder="Search..." className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:border-primary outline-none" />
                 </div>
              </div>
              <div className="glass-card overflow-hidden">
                 <div className="overflow-x-auto">
                   <table className="w-full text-left text-sm">
                     <thead className="bg-white/5 text-gray-400 text-[10px] uppercase tracking-widest font-bold">
                       <tr>
                         <th className="p-4">Patient Name</th>
                         <th className="p-4">Risk Level</th>
                         <th className="p-4">Last Active</th>
                         <th className="p-4 text-right">Monitoring</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5 text-gray-300">
                       {filteredPatients.length === 0 ? (
                         <tr><td colSpan="4" className="text-center p-8 text-gray-500">No patients found.</td></tr>
                       ) : (
                         filteredPatients.map(p => (
                           <tr key={p._id} className={`hover:bg-white/5 transition-colors group ${selectedPatient?._id === p._id ? 'bg-primary/5' : ''}`}>
                             <td className="p-4 flex items-center gap-3 cursor-pointer" onClick={() => { setSelectedPatient(p); setVitalsData([]); }}>
                                <div className="w-9 h-9 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">{p.userId?.name?.charAt(0) || '?'}</div>
                                <span className="font-bold group-hover:text-primary transition-colors">{p.userId?.name || 'Unknown Patient'}</span>
                             </td>
                             <td className="p-4">
                               <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${p.riskLevel === 'High' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>{p.riskLevel || 'Low'}</span>
                             </td>
                             <td className="p-4 text-xs text-gray-500">Today, 10:45 AM</td>
                             <td className="p-4 text-right">
                                <button onClick={() => { setSelectedPatient(p); setVitalsData([]); }} className={`p-2 rounded-lg transition-all ${selectedPatient?._id === p._id ? 'text-primary bg-primary/10' : 'text-gray-600 hover:text-white'}`}>
                                   <Activity size={16}/>
                                </button>
                             </td>
                           </tr>
                         ))
                       )}
                     </tbody>
                   </table>
                 </div>
              </div>
           </div>
        </div>

        {/* Alerts for Doctors */}
        <div className="space-y-4">
           <h2 className="text-xl font-bold text-white tracking-tight px-1">Alerts & Notifications</h2>
           <div className="space-y-3">
              {[
                { title: "Session Reschedule Request", desc: "Rakesh Chaudhary requested move to 29th June", color: "bg-red-500/10 border-red-500/20 text-red-500", icon: Clock },
                { title: "Swasthya Setu Platform Update", desc: "New diagnostics tools are now available", color: "bg-primary/10 border-primary/20 text-primary", icon: Activity },
                { title: "New Message from Rakesh", desc: "This is my report. Kindly go through it...", color: "bg-accent/10 border-accent/20 text-accent", icon: MessageSquare },
              ].map((alert, i) => (
                <div key={i} className={`p-4 rounded-2xl flex items-center gap-4 border group cursor-pointer transition-all ${alert.color} hover:bg-white/5 hover:border-white/20`}>
                   <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10 group-hover:scale-110 transition-transform"><alert.icon size={20} /></div>
                   <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold truncate">{alert.title}</h4>
                      <p className="text-xs text-gray-500 truncate">{alert.desc}</p>
                   </div>
                   <ArrowRight size={16} className="text-gray-600 group-hover:text-white transition-colors" />
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="space-y-8">
        <CalendarWidget />
        <RecentSessions />
        
        {/* Quick Reports Card */}
        <div className="p-6 glass-card border border-primary/20 bg-primary/5 relative overflow-hidden group">
           <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
           <div className="flex items-center gap-2 text-white font-bold mb-4"><FileText size={20} className="text-primary"/> Quick Reports</div>
           <p className="text-xs text-gray-400 mb-6 leading-relaxed">Generate detailed AI diagnostics and historical trends for your currently monitored patient in one-click.</p>
           <button className="w-full py-3 bg-primary text-dark-bg font-bold rounded-xl text-sm transition-all shadow-lg hover:scale-105 active:scale-95">
              Go to Patient Reports
           </button>
        </div>
      </div>
    </div>
  );
};
