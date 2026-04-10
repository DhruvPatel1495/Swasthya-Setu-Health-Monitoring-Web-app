import React from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

export const CalendarWidget = () => {
  const [view, setView] = React.useState('monthly'); 
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const today = now.getDate();

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calculate calendar grid
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const dates = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="glass-card p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex bg-white/5 rounded-lg p-1">
          <button 
            onClick={() => setView('monthly')}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${view === 'monthly' ? 'bg-primary text-dark-bg shadow-lg' : 'text-gray-400 hover:text-white'}`}
          >
            Monthly
          </button>
          <button 
            onClick={() => setView('daily')}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${view === 'daily' ? 'bg-primary text-dark-bg shadow-lg' : 'text-gray-400 hover:text-white'}`}
          >
            Daily
          </button>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
           <button className="hover:text-white"><ChevronLeft size={18} /></button>
           <span className="text-sm font-bold text-white">{monthNames[currentMonth]} {currentYear}</span>
           <button className="hover:text-white"><ChevronRight size={18} /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center">
        {days.map(day => (
          <div key={day} className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{day}</div>
        ))}
        {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
        {dates.map(date => {
          const isToday = date === today;
          const isSelected = [10, 17, 24, today].includes(date);
          return (
            <div 
              key={date} 
              className={`aspect-square flex items-center justify-center text-sm rounded-lg cursor-pointer transition-all relative ${
                isToday ? 'bg-primary text-dark-bg font-bold ring-4 ring-primary/20' : 
                isSelected ? 'text-primary font-bold' : 'text-gray-400 hover:bg-white/5'
              }`}
            >
              {date}
              {isSelected && !isToday && <span className="absolute bottom-1 w-1 h-1 bg-primary rounded-full"></span>}
            </div>
          );
        })}
      </div>

      <div className="pt-6 border-t border-white/5 space-y-4">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Selected Session</h4>
        <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-between group cursor-pointer hover:bg-primary/20 transition-all">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-primary uppercase">13:00 PM to 14:00 PM</p>
            <h5 className="font-bold text-white">Dr. Anil Ojha</h5>
            <p className="text-xs text-gray-400">Depression Treatment</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center">
             <CalendarIcon size={18} />
          </div>
        </div>
        <button className="w-full py-3 bg-white/5 hover:bg-white/10 text-gray-300 font-bold rounded-xl text-sm transition-all">
          Join Session
        </button>
      </div>
    </div>
  );
};
