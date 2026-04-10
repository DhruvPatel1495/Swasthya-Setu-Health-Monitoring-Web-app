import React, { useContext, useState, useRef, useEffect } from 'react';
import {
  Bell, Search, Activity, Users, Settings, LogOut,
  FileText, Calendar as CalendarIcon, MessageSquare,
  Store, Menu, X, ChevronDown, Loader2
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { API_URL } from '../../config';

export const Navbar = ({ onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // Search State
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Debounced Search Effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch(query);
      } else {
        setResults(null);
        setShowDropdown(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const performSearch = async (searchTerm) => {
    setIsSearching(true);
    setShowDropdown(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(searchTerm)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleResultClick = (path) => {
    navigate(path);
    setQuery('');
    setShowDropdown(false);
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', roles: ['Doctor', 'Patient', 'Admin'] },
    { label: 'Patients', path: '/dashboard/patients', roles: ['Doctor', 'Admin'] },
    { label: 'Find Doctor', path: '/dashboard/marketplace', roles: ['Patient', 'Admin'] },
    { label: 'Chats', path: '/dashboard/messages', roles: ['Doctor', 'Patient', 'Admin'] },
    { label: 'Appointments', path: '/dashboard/appointments', roles: ['Doctor', 'Patient', 'Admin'] },
    { label: 'Reports', path: '/dashboard/reports', roles: ['Doctor', 'Patient', 'Admin'] },
  ];

  const filteredNavItems = navItems.filter(item =>
    item.roles.includes(user?.role || 'Patient')
  );

  return (
    <nav className="h-20 px-4 md:px-8 flex items-center justify-between border-b border-white/10 bg-dark-bg/90 backdrop-blur-xl sticky top-0 z-50">

      {/* Left: Logo */}
      <Link to="/" className="flex items-center gap-3 shrink-0">
        <img src="/logo.svg" alt="Swasthya Setu" className="h-16 w-auto object-contain transition-all hover:scale-105" />
      </Link>

      {/* Center: Nav Items (Desktop) */}
      <div className="hidden lg:flex items-center gap-1 mx-6">
        {filteredNavItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-primary/15 text-primary border border-primary/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Right: Actions + Profile */}
      <div className="flex items-center gap-2 md:gap-3">

        {/* Search (Desktop) */}
        <div className="relative hidden xl:block w-72" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.length >= 2 && setShowDropdown(true)}
              placeholder="Search doctors, patients, reports..."
              className="w-full bg-white/5 border border-white/10 rounded-lg py-1.5 pl-8 pr-3 text-xs text-white focus:outline-none focus:border-primary/50 transition-all"
            />
            {isSearching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-primary animate-spin" size={12} />}
          </div>

          {/* Search Dropdown */}
          {showDropdown && (
            <div className="absolute top-full mt-2 w-full bg-dark-card border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 max-h-[400px] overflow-y-auto z-[60]">
              {isSearching ? (
                <div className="p-4 text-center text-gray-500 text-xs italic">Searching...</div>
              ) : results && (Object.values(results).some(arr => arr.length > 0)) ? (
                <div className="p-2 space-y-4">
                  {results.doctors?.length > 0 && (
                    <section>
                      <h3 className="px-2 pb-1 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Doctors</h3>
                      {results.doctors.map(doc => (
                        <div key={doc._id} onClick={() => handleResultClick(`/doctor/${doc._id}`)} className="p-2 hover:bg-white/5 rounded-lg cursor-pointer transition-colors flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">D</div>
                          <div>
                            <p className="text-xs font-medium text-white">{doc.name}</p>
                            <p className="text-[10px] text-gray-500">{doc.email}</p>
                          </div>
                        </div>
                      ))}
                    </section>
                  )}
                  {results.patients?.length > 0 && (
                    <section>
                      <h3 className="px-2 pb-1 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Patients</h3>
                      {results.patients.map(pat => (
                        <div key={pat._id} onClick={() => handleResultClick('/dashboard/patients')} className="p-2 hover:bg-white/5 rounded-lg cursor-pointer transition-colors flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-bold">P</div>
                          <div>
                            <p className="text-xs font-medium text-white">{pat.name}</p>
                            <p className="text-[10px] text-gray-500">{pat.email}</p>
                          </div>
                        </div>
                      ))}
                    </section>
                  )}
                  {results.reports?.length > 0 && (
                    <section>
                      <h3 className="px-2 pb-1 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Reports</h3>
                      {results.reports.map(rep => (
                        <div key={rep._id} onClick={() => handleResultClick('/dashboard/reports')} className="p-2 hover:bg-white/5 rounded-lg cursor-pointer transition-colors flex items-center gap-3">
                          <FileText className="text-secondary" size={16} />
                          <div>
                            <p className="text-xs font-medium text-white line-clamp-1">{rep.title}</p>
                            <p className="text-[10px] text-gray-500">Patient: {rep.patientId?.name}</p>
                          </div>
                        </div>
                      ))}
                    </section>
                  )}
                  {results.appointments?.length > 0 && (
                    <section>
                      <h3 className="px-2 pb-1 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Appointments</h3>
                      {results.appointments.map(app => (
                        <div key={app._id} onClick={() => handleResultClick('/dashboard/appointments')} className="p-2 hover:bg-white/5 rounded-lg cursor-pointer transition-colors flex items-center gap-3">
                          <CalendarIcon className="text-primary" size={16} />
                          <div>
                            <p className="text-xs font-medium text-white line-clamp-1">{app.purpose}</p>
                            <p className="text-[10px] text-gray-500">{app.timeSlot}</p>
                          </div>
                        </div>
                      ))}
                    </section>
                  )}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500 text-xs italic">No results found for "{query}"</div>
              )}
            </div>
          )}
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-lg border border-white/10">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
        </button>

        {/* Profile Dropdown */}
        <div className="relative hidden md:block" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2.5 pl-3 pr-2.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-dark-bg text-xs font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-white leading-tight">{user?.name || 'User'}</p>
              <p className="text-[10px] text-primary leading-tight">{user?.role || 'Patient'}</p>
            </div>
            <ChevronDown size={14} className={`text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-2 w-44 bg-dark-card border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              <Link
                to="/dashboard/settings"
                onClick={() => setIsProfileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Settings size={15} />
                Settings
              </Link>
              <div className="border-t border-white/10" />
              <button
                onClick={() => { setIsProfileOpen(false); onLogout(); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors"
              >
                <LogOut size={15} />
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Standalone Logout Button (visible on medium screens without dropdown) */}
        <button
          onClick={onLogout}
          title="Logout"
          className="hidden sm:flex md:hidden items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 bg-red-400/10 hover:bg-red-400/20 border border-red-400/20 rounded-lg transition-all"
        >
          <LogOut size={16} />
          <span className="text-xs font-medium">Logout</span>
        </button>

        {/* Mobile Menu Toggle */}
        <button
          className="lg:hidden p-2 text-gray-400 hover:text-white bg-white/5 rounded-lg border border-white/10"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-dark-bg/98 backdrop-blur-2xl border-b border-white/10 flex flex-col p-4 space-y-1 lg:hidden animate-in fade-in slide-in-from-top-2">
          {filteredNavItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                location.pathname === item.path
                  ? 'bg-primary/15 text-primary border border-primary/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.label}
            </Link>
          ))}
          <div className="border-t border-white/10 pt-2 mt-2">
            <Link
              to="/dashboard/settings"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <Settings size={16} />
              Settings
            </Link>
            <button
              onClick={() => { setIsMobileMenuOpen(false); onLogout(); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
