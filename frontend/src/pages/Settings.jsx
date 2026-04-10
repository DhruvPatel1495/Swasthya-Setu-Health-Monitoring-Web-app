import React, { useContext, useState } from 'react';
import { API_URL } from '../config';
import { AuthContext } from '../context/AuthContext';
import { Settings as SettingsIcon, Shield, Bell, User, Mail, Lock, Check, AlertCircle } from 'lucide-react';
import { Button } from '../components/common/Button';

const Settings = () => {
  const { user, token, login } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [password, setPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setProfileMsg({ type: '', text: '' });
    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name, email })
      });
      const data = await res.json();
      if (res.ok) {
        login(data, data.token);
        setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        setProfileMsg({ type: 'error', text: data.message || 'Error updating profile' });
      }
    } catch (error) {
      setProfileMsg({ type: 'error', text: 'Server error' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPasswordMsg({ type: '', text: '' });
    try {
      const res = await fetch(`${API_URL}/auth/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (res.ok) {
        setPassword('');
        setPasswordMsg({ type: 'success', text: 'Password changed successfully!' });
      } else {
        setPasswordMsg({ type: 'error', text: data.message || 'Error updating password' });
      }
    } catch (error) {
      setPasswordMsg({ type: 'error', text: 'Server error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      <div className="mb-10">
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Account Settings</h2>
        <p className="text-gray-400 mt-1">Personalize your experience and manage security preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <nav className="flex flex-col gap-2 glass-card p-2 border-white/5">
            <button 
               onClick={() => setActiveTab('profile')} 
               className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-left font-bold transition-all relative overflow-hidden group ${activeTab === 'profile' ? 'text-primary bg-primary/10 border border-primary/20 shadow-inner' : 'text-gray-500 hover:text-gray-200 hover:bg-white/5'}`}
            >
              <User size={18} className={activeTab === 'profile' ? 'text-primary' : 'text-gray-500 group-hover:text-gray-300'}/> 
              Personal Profile
              {activeTab === 'profile' && <div className="absolute right-0 top-0 h-full w-1 bg-primary rounded-l-full shadow-lg"></div>}
            </button>
            <button 
              onClick={() => setActiveTab('security')} 
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-left font-bold transition-all relative overflow-hidden group ${activeTab === 'security' ? 'text-primary bg-primary/10 border border-primary/20 shadow-inner' : 'text-gray-500 hover:text-gray-200 hover:bg-white/5'}`}
            >
              <Shield size={18} className={activeTab === 'security' ? 'text-primary' : 'text-gray-500 group-hover:text-gray-300'}/> 
              Security & Access
              {activeTab === 'security' && <div className="absolute right-0 top-0 h-full w-1 bg-primary rounded-l-full shadow-lg"></div>}
            </button>
            <button 
              onClick={() => setActiveTab('notifications')} 
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-left font-bold transition-all relative overflow-hidden group ${activeTab === 'notifications' ? 'text-primary bg-primary/10 border border-primary/20 shadow-inner' : 'text-gray-500 hover:text-gray-200 hover:bg-white/5'}`}
            >
              <Bell size={18} className={activeTab === 'notifications' ? 'text-primary' : 'text-gray-500 group-hover:text-gray-300'}/> 
              Notifications
              {activeTab === 'notifications' && <div className="absolute right-0 top-0 h-full w-1 bg-primary rounded-l-full shadow-lg"></div>}
            </button>
          </nav>
          
          <div className="mt-8 p-6 glass-card border-accent/20 bg-accent/5">
             <h4 className="text-white font-bold text-sm mb-2 flex items-center gap-2"><AlertCircle size={14} className="text-accent"/> Verification Area</h4>
             <p className="text-xs text-gray-500 leading-relaxed mb-4">Your account is fully verified. To change your role or delete account, contact support.</p>
             <span className="text-[10px] font-black uppercase text-accent bg-accent/10 px-2 py-1 rounded border border-accent/20">Verified Identity</span>
          </div>
        </div>

        <div className="lg:col-span-3">
          {activeTab === 'profile' && (
            <div className="glass-card p-8 border border-white/5 relative overflow-hidden animate-in slide-in-from-right-4 duration-500">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
              
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 border border-white/10 flex items-center justify-center text-2xl font-black text-primary shadow-inner">
                    {user?.name.charAt(0)}
                 </div>
                 <div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Personal Details</h3>
                    <p className="text-gray-400 text-sm">Update your identity and contact information.</p>
                 </div>
              </div>

              {profileMsg.text && (
                <div className={`p-4 rounded-xl mb-8 flex items-center gap-3 border ${profileMsg.type === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                   {profileMsg.type === 'success' ? <Check size={18}/> : <AlertCircle size={18}/>}
                   <span className="text-sm font-bold">{profileMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 px-1">Full Name</label>
                    <div className="relative">
                       <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={18}/>
                       <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-white focus:border-primary outline-none transition-all placeholder:text-gray-700" required />
                    </div>
                  </div>
                  <div className="group">
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 px-1">Email Address</label>
                    <div className="relative">
                       <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={18}/>
                       <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-white focus:border-primary outline-none transition-all placeholder:text-gray-700" required />
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-white/5">
                   <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 px-1">Account Permission</label>
                   <div className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-primary font-black uppercase tracking-widest cursor-not-allowed flex items-center justify-between">
                      <span>{user?.role} Access Level</span>
                      <Shield size={18}/>
                   </div>
                </div>

                <div className="flex justify-end pt-4">
                   <button type="submit" disabled={loading} className="px-8 py-4 bg-primary text-dark-bg font-black uppercase tracking-widest text-xs rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all">
                      {loading ? "Updating..." : "Save Configuration"}
                   </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="glass-card p-10 border border-white/5 relative overflow-hidden animate-in slide-in-from-right-4 duration-500">
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Security & Password</h3>
              <p className="text-gray-400 text-sm mb-10">Maintain a secure account by updating your credentials regularly.</p>

              {passwordMsg.text && (
                <div className={`p-4 rounded-xl mb-10 flex items-center gap-3 border ${passwordMsg.type === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                   {passwordMsg.type === 'success' ? <Check size={18}/> : <AlertCircle size={18}/>}
                   <span className="text-sm font-bold">{passwordMsg.text}</span>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-8 max-w-md">
                <div className="group">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3 px-1">New System Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={18}/>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:border-primary outline-none transition-all placeholder:text-gray-700 font-mono" required placeholder="••••••••" minLength={6} />
                  </div>
                </div>
                
                <div className="bg-red-500/5 border border-red-500/10 p-5 rounded-2xl">
                   <p className="text-[10px] text-red-400 uppercase font-black tracking-widest flex items-center gap-2 mb-2">
                      <AlertCircle size={12}/> Security Protocol
                   </p>
                   <p className="text-xs text-gray-500 leading-relaxed">Updating your password will not log you out of current active sessions, but will require the new password for all subsequent authentication requests.</p>
                </div>

                <div className="pt-2 flex justify-start">
                   <button type="submit" disabled={loading} className="px-8 py-4 bg-primary text-dark-bg font-black uppercase tracking-widest text-xs rounded-2xl shadow-lg hover:scale-105 transition-all">
                      {loading ? "Processing..." : "Update Security Key"}
                   </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="glass-card p-16 border border-white/5 flex flex-col items-center justify-center text-center animate-in slide-in-from-right-4 duration-500">
              <div className="p-8 bg-white/[0.02] text-gray-600 rounded-[2.5rem] mb-8 border border-white/5 shadow-inner">
                 <Bell size={64} className="opacity-10" />
              </div>
              <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-3">Notification Pulse</h3>
              <p className="text-gray-400 text-sm max-w-xs mx-auto mb-10 leading-relaxed">We are building an intelligent health notification engine with real-time vitals alerts via SMS and encrypted Email pulses.</p>
              <div className="w-full max-w-sm space-y-4 opacity-10 pointer-events-none grayscale">
                 <div className="flex justify-between items-center p-5 bg-white/5 rounded-2xl border border-white/5">
                    <span className="text-sm font-bold text-gray-400">Critical Vitals SMS</span>
                    <div className="w-12 h-7 bg-primary/20 rounded-full flex items-center px-1"><div className="w-5 h-5 bg-primary rounded-full shadow-lg"></div></div>
                 </div>
                 <div className="flex justify-between items-center p-5 bg-white/5 rounded-2xl border border-white/5">
                    <span className="text-sm font-bold text-gray-400">Weekly Health Summary</span>
                    <div className="w-12 h-7 bg-primary/20 rounded-full flex items-center px-1"><div className="w-5 h-5 bg-primary rounded-full shadow-lg"></div></div>
                 </div>
              </div>
              <div className="mt-12 text-[10px] font-black uppercase tracking-[0.4em] text-primary bg-primary/10 px-6 py-2.5 rounded-full border border-primary/20">Coming in Version 2.0</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
