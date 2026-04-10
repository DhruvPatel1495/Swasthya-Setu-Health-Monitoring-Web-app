import React from 'react';
import { Mic, Video, ArrowRight } from 'lucide-react';

export const RecentSessions = () => {
  const sessions = [
    { name: "Dr. Abhishek Mehta", duration: "50 minutes Voice Session", time: "04:00PM", type: "voice" },
    { name: "Dr. Abhishek Mehta", duration: "50 minutes Video Session", time: "04:00PM", type: "video" },
    { name: "Dr. Abhishek Mehta", duration: "50 minutes Voice Session", time: "04:00PM", type: "voice" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white tracking-tight">Recent Sessions</h3>
        <button className="text-xs font-bold text-primary hover:underline uppercase tracking-widest">View All</button>
      </div>
      <div className="space-y-3">
        {sessions.map((s, i) => (
          <div key={i} className="glass-card p-4 flex items-center gap-4 group cursor-pointer hover:bg-white/5 transition-all">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold border border-primary/30 group-hover:scale-110 transition-transform">
              {s.name.charAt(4)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-white truncate">{s.name}</h4>
              <p className="text-xs text-gray-500 truncate">{s.duration}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] font-bold text-gray-400 mb-1">{s.time}</p>
              {s.type === 'voice' ? <Mic size={14} className="text-primary ml-auto" /> : <Video size={14} className="text-accent ml-auto" />}
            </div>
          </div>
        ))}
      </div>
      <button className="w-full py-4 bg-primary text-dark-bg font-bold rounded-2xl text-sm shadow-xl hover:scale-105 transition-all mt-4">
         View All
      </button>
    </div>
  );
};
