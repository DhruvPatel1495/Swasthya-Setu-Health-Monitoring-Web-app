import React, { useContext } from 'react';
import { Bell, Search } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

export const TopNav = ({ title = "Dashboard" }) => {
  const { user } = useContext(AuthContext);

  return (
    <header className="h-20 px-8 flex items-center justify-between border-b border-dark-border bg-dark-bg/80 backdrop-blur-md sticky top-0 z-20">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
      </div>
      
      <div className="flex-1 max-w-md px-8 hidden lg:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Search patients, alerts..." 
            className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
          <Bell size={24} />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-dark-bg shadow-[0_0_10px_rgba(239,68,68,0.5)]"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-4 border-l border-white/10">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold shadow-lg">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
            <p className="text-xs text-primary">{user?.role || 'Patient'}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
