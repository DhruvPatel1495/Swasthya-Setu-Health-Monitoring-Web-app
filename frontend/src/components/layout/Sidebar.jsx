import React, { useContext } from 'react';
import { Activity, Users, Settings, LogOut, FileText, Calendar as CalendarIcon, MessageSquare, Store } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export const Sidebar = ({ onLogout }) => {
  const location = useLocation();
  const { user } = useContext(AuthContext);

  const navItems = [
    { icon: Activity, label: 'Live Monitor', path: '/', roles: ['Doctor', 'Patient', 'Admin'] },
    { icon: Users, label: 'Patients', path: '/patients', roles: ['Doctor', 'Admin'] },
    { icon: Store, label: 'Find Doctor', path: '/marketplace', roles: ['Patient', 'Admin'] },
    { icon: MessageSquare, label: 'Messages', path: '/messages', roles: ['Doctor', 'Patient', 'Admin'] },
    { icon: CalendarIcon, label: 'Appointments', path: '/appointments', roles: ['Doctor', 'Patient', 'Admin'] },
    { icon: FileText, label: 'Reports', path: '/reports', roles: ['Doctor', 'Patient', 'Admin'] },
    { icon: Settings, label: 'Settings', path: '/settings', roles: ['Doctor', 'Patient', 'Admin'] },
  ];

  return (
    <div className="w-64 h-screen bg-dark-card border-r border-dark-border flex-col hidden md:flex sticky top-0">
      <div className="p-6">
        <img src="/logo.svg" alt="Swasthya Setu" className="h-14 w-auto" />
      </div>
      
      <nav className="flex-1 px-4 mt-6 space-y-2">
        {navItems
          .filter(item => {
            const mappedRole = (user?.role === 'Doctor' || user?.role === 'Admin') ? user.role : 'Patient';
            return item.roles.includes(mappedRole);
          })
          .map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.label} 
              to={item.path} 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                isActive 
                  ? 'bg-primary/20 text-primary border border-primary/30 shadow-[0_0_15px_rgba(0,242,254,0.1)]' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={20} className={isActive ? 'text-primary' : ''} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-dark-border">
        <button 
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};
