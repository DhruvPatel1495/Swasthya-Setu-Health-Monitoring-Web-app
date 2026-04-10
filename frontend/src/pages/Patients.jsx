import React, { useState, useEffect, useContext } from 'react';
import { API_URL } from '../config';
import { AuthContext } from '../context/AuthContext';
import { Search, UserPlus, Trash2, Edit, MoreVertical, Filter, FileText } from 'lucide-react';
import { TableSkeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';

const Patients = () => {
  const { token, user } = useContext(AuthContext);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await fetch(`${API_URL}/patient`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setPatients(data);
      } catch (e) {
        console.error("Error fetching patients", e);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, [token]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this patient?")) return;
    try {
      const res = await fetch(`${API_URL}/patient/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setPatients(patients.filter(p => p._id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = patients.filter(p => 
    p.userId?.name.toLowerCase().includes(search.toLowerCase()) || 
    p.userId?.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Patients Directory</h2>
          <p className="text-gray-400">Manage and monitor health records for all assigned patients.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all shadow-xl"
            />
          </div>
          <button className="flex items-center gap-2 bg-primary text-dark-bg px-6 py-3 rounded-2xl font-bold hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-lg">
            <UserPlus size={18} /> Add Patient
          </button>
        </div>
      </div>

      <div className="glass-card overflow-hidden shadow-2xl border border-white/5">
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
           <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest leading-none">
              <Filter size={14} className="text-primary" /> Filters: <span className="text-primary bg-primary/10 px-2 py-1 rounded-md">Active</span>
           </div>
           <div className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Total: {filtered.length} Patients</div>
        </div>
        
        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <TableSkeleton rows={8} />
          ) : filtered.length === 0 ? (
            <div className="py-20">
               <EmptyState 
                  icon={Search} 
                  title="No patients found" 
                  message={search ? `No results match "${search}". Try a different term.` : "Your patient directory is currently empty."} 
               />
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 text-gray-500 text-[10px] uppercase tracking-[0.2em] font-black">
                  <th className="p-6">Patient Profile</th>
                  <th className="p-6">Health Risk</th>
                  <th className="p-6">Vitals Status</th>
                  <th className="p-6">Registration</th>
                  <th className="p-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {filtered.map((patient) => (
                  <tr key={patient._id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-6">
                       <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary font-bold text-lg group-hover:scale-110 group-hover:bg-primary group-hover:text-dark-bg transition-all duration-300">
                            {patient.userId?.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-bold text-white group-hover:text-primary transition-colors">{patient.userId?.name}</h3>
                            <p className="text-xs text-gray-500 font-medium">{patient.userId?.email}</p>
                          </div>
                       </div>
                    </td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                         patient.riskLevel === 'Low' ? 'bg-green-500/5 text-green-400 border-green-500/20' :
                         patient.riskLevel === 'Medium' ? 'bg-yellow-500/5 text-yellow-400 border-yellow-500/20' :
                         'bg-red-500/5 text-red-400 border-red-500/20'
                      }`}>
                        {patient.riskLevel || 'Low'}
                      </span>
                    </td>
                    <td className="p-6">
                        <div className="flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.4)]"></div>
                           <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Steady Pulse</span>
                        </div>
                    </td>
                    <td className="p-6 text-xs text-gray-500 font-bold">
                       {new Date(patient.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-10 md:opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                        <button className="p-2.5 bg-white/5 hover:bg-primary/20 text-gray-400 hover:text-primary rounded-xl transition-all" title="View Records"><FileText size={18} /></button>
                        <button className="p-2.5 bg-white/5 hover:bg-primary/20 text-gray-400 hover:text-primary rounded-xl transition-all" title="Edit Patient"><Edit size={18} /></button>
                        <button className="p-2.5 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-xl transition-all" onClick={() => handleDelete(patient._id)} title="Remove"><Trash2 size={18} /></button>
                      </div>
                      <button className="md:hidden p-2 text-gray-500 active:text-primary"><MoreVertical size={20}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Patients;
