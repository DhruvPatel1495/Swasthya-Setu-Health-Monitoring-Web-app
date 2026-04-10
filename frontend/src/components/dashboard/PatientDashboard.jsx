import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config';
import { StatsCard } from '../common/StatsCard';
import { VitalsChart } from './VitalsChart';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Activity, Clock, MessageSquare, BrainCircuit, AlertTriangle, ArrowRight, Video, CheckCircle, Calendar as CalendarIcon } from 'lucide-react';
import { CardSkeleton, ChartSkeleton } from '../common/Skeleton';
import { EmptyState } from '../common/EmptyState';
import { CalendarWidget } from './CalendarWidget';
import { RecentSessions } from './RecentSessions';

export const PatientDashboard = ({ user, token, socket, vitalsData, alerts, latestAI }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState('1d 18h 45m 57s');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_URL}/appointments/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        const resMessages = await fetch(`${API_URL}/chat/unread-count`, {
           headers: { 'Authorization': `Bearer ${token}` }
        });
        const dataMessages = await resMessages.json();
        setStats({ ...data, unreadMessages: dataMessages.count });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();

    // Mock countdown timer
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

  if (loading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChartSkeleton className="lg:col-span-2" /><ChartSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Main Content */}
      <div className="lg:col-span-2 space-y-8">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <StatsCard title="Sessions Attended" value={stats?.attended || 0} icon={CheckCircle} color="success" />
          <StatsCard title="Upcoming Sessions" value={stats?.upcoming || 0} icon={CalendarIcon} color="primary" />
          <StatsCard title="Session Duration" value="3h 35min" icon={Clock} color="accent" />
          <StatsCard title="Unread Messages" value={stats?.unreadMessages || 5} icon={MessageSquare} color={stats?.unreadMessages > 0 ? "warning" : "primary"} />
        </div>

        {/* Upcoming Session Highlight */}
        <div className="space-y-4">
           <h2 className="text-xl font-bold text-white tracking-tight px-1">Upcoming Session</h2>
           <div className="glass-card p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10 group-hover:scale-110 transition-transform"></div>
              <div className="space-y-4 text-center md:text-left">
                 <p className="text-sm font-medium text-gray-400">
                    Next Voice Session with <span className="text-primary font-bold">Dr. Nitin Mehta</span> on <br />
                    <span className="text-white font-bold">Depression Treatment</span>
                 </p>
                 <div className="text-4xl md:text-5xl font-extrabold text-white tracking-tighter">
                    {timeLeft}
                 </div>
              </div>
              <div className="flex flex-col gap-3 w-full md:w-auto">
                 <button className="px-8 py-3 bg-primary text-dark-bg font-bold rounded-2xl shadow-xl hover:scale-105 transition-all">Join Session</button>
                 <button className="px-8 py-3 bg-white/5 border border-white/10 text-gray-300 font-bold rounded-2xl hover:bg-white/10 transition-all">Change Date / Time</button>
              </div>
           </div>
        </div>

        {/* Live Vitals & AI Integration */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
             <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
               <Activity className="text-primary" /> Live Vitals & AI Insights
             </h2>
             <span className="flex items-center gap-2 text-[10px] text-green-400 font-bold uppercase tracking-widest bg-green-400/5 px-2 py-1 rounded-full border border-green-400/20">
               <span className="w-1.5 h-1.5 bg-green-400 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.5)]"></span> Telemetry Active
             </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <VitalsChart data={vitalsData} dataKey="heartRate" color="#ef4444" title="Heart Rate" unit="bpm" />
            <VitalsChart data={vitalsData} dataKey="spo2" color="#3b82f6" title="SpO2" unit="%" />
          </div>
          
          <div className="glass-card p-6 border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors">
            <div className="flex items-center gap-4 mb-4">
               <div className="p-3 bg-primary/20 text-primary rounded-xl">
                  <BrainCircuit size={24} />
               </div>
               <div>
                  <h3 className="text-lg font-bold text-white">Groq AI Analysis</h3>
                  <p className="text-xs text-gray-500">LLaMA-3 Health Intelligence</p>
               </div>
            </div>
            <div className="bg-dark-bg/60 backdrop-blur-sm rounded-xl p-5 border border-white/5 text-gray-300 text-sm leading-relaxed min-h-[100px] whitespace-pre-wrap">
               {latestAI}
            </div>
          </div>
        </div>

        {/* Alerts Section */}
        <div className="space-y-4">
           <h2 className="text-xl font-bold text-white tracking-tight px-1">Alerts</h2>
           <div className="space-y-3">
              {[
                { title: "Session Reschedule Request", desc: "Reschedule to 29th June 2024, 04:00PM to 05...", color: "bg-red-500/10 border-red-500/20 text-red-500", icon: Clock },
                { title: "Swasthya Setu", desc: "Explore our Services and Telehealth features", color: "bg-primary/10 border-primary/20 text-primary", icon: Activity },
                { title: "Dr. Umang Mehta", desc: "Can you please send your report?", color: "bg-accent/10 border-accent/20 text-accent", icon: MessageSquare },
                { title: "Meeting Scheduled on 2nd October 2026", desc: "Dr. Ramesh Upadhyay, Clinical Therapy", color: "bg-white/5 border-white/10 text-gray-300", icon: CalendarIcon },
              ].map((alert, i) => (
                <div key={i} className={`p-4 rounded-2xl flex items-center gap-4 border group cursor-pointer transition-all ${alert.color} hover:bg-white/5 hover:border-white/20`}>
                   <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10 group-hover:scale-110 transition-transform">
                      <alert.icon size={20} />
                   </div>
                   <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold truncate">{alert.title}</h4>
                      <p className="text-xs text-gray-500 truncate">{alert.desc}</p>
                   </div>
                   <ArrowRight size={16} className="text-gray-600 group-hover:text-white transition-colors" />
                </div>
              ))}
              <div className="pt-2">
                 <button className="w-full py-3 bg-white/5 hover:bg-white/10 text-gray-400 font-bold rounded-2xl text-xs uppercase tracking-widest transition-all">View All Alerts</button>
              </div>
           </div>
        </div>
      </div>

      {/* Right Column: Widgets */}
      <div className="space-y-8">
        <CalendarWidget />
        <RecentSessions />
      </div>
    </div>
  );
};
