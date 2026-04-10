import React, { useState, useEffect, useContext, useRef } from 'react';
import { API_URL } from '../config';
import { AuthContext } from '../context/AuthContext';
import { FileText, Download, Clock, Loader2, Search, FilePlus, User } from 'lucide-react';
import { CardSkeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';

const Reports = () => {
  const { token, user } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const fileInputRef = useRef(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/report`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setReports(data);
    } catch (e) {
      console.error("Error fetching reports", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [token]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('report', file);
    formData.append('title', file.name);

    try {
      const res = await fetch(`${API_URL}/report/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        fetchReports();
      } else {
        const err = await res.json();
        alert('Upload failed: ' + err.message);
      }
    } catch (e) {
      console.error(e);
      alert('Error uploading file');
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  const filtered = reports.filter(r => 
    r.title.toLowerCase().includes(search.toLowerCase()) || 
    (r.patientId?.name && r.patientId.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Health Reports</h2>
          <p className="text-gray-400">{user?.role === 'Doctor' ? 'Manage and review AI-generated diagnostics for all patients.' : 'Review your historical diagnostic reports and AI summaries.'}</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search reports..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm text-white focus:border-primary outline-none transition-all shadow-xl"
            />
          </div>
          {user?.role === 'Patient' && (
            <>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="application/pdf,image/*" className="hidden" />
              <button 
                onClick={() => fileInputRef.current.click()} 
                disabled={uploading}
                className="bg-primary text-dark-bg px-6 py-3 rounded-2xl font-bold hover:bg-primary/90 flex items-center gap-2 disabled:opacity-50 transition-all hover:scale-105 active:scale-95 shadow-lg"
              >
                {uploading ? <Loader2 className="animate-spin" size={20}/> : <FilePlus size={20}/>} 
                {uploading ? 'Uploading...' : 'New Report'}
              </button>
            </>
          )}
        </div>
      </div>

      {loading ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CardSkeleton/><CardSkeleton/><CardSkeleton/><CardSkeleton/><CardSkeleton/><CardSkeleton/>
         </div>
      ) : filtered.length === 0 ? (
         <div className="py-24 text-center glass-card border-white/5 rounded-[2.5rem]">
           <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/10">
              <FileText size={32} className="text-gray-600" />
           </div>
           <h3 className="text-xl font-bold text-white mb-2">No reports found</h3>
           <p className="text-gray-400 max-w-sm mx-auto">This section is currently empty. Reports will appear here once generated or uploaded.</p>
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((r) => (
            <div key={r._id} className="glass-card p-6 flex flex-col group hover:border-primary/40 transition-all duration-500 hover:-translate-y-1 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-10 group-hover:bg-primary/10 transition-colors"></div>
               
               <div className="flex items-start justify-between mb-8">
                  <div className="p-4 bg-white/5 border border-white/10 text-primary rounded-2xl group-hover:bg-primary group-hover:text-dark-bg transition-all duration-300 shadow-xl group-hover:scale-110">
                    <FileText size={28} />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                     <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded-md border border-white/5">
                        {new Date(r.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                     </span>
                     <span className="text-[10px] text-primary/60 font-black uppercase tracking-[0.2em] leading-none">Diagnostic PDF</span>
                  </div>
               </div>

               <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors line-clamp-1">{r.title}</h3>
               
               {user?.role === 'Doctor' && r.patientId && (
                 <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest bg-primary/5 w-fit px-3 py-1 rounded-full mt-2 border border-primary/10">
                    <User size={12}/> {r.patientId.name}
                 </div>
               )}
               
               <p className="text-sm text-gray-400 mt-4 mb-8 leading-relaxed flex-1 line-clamp-3 font-medium">
                  {r.summary || "This diagnostic report contains a detailed summary of patient vitals and AI-driven health assessments."}
               </p>
               
               <a 
                 href={r.pdfUrl} 
                 target="_blank" 
                 rel="noreferrer" 
                 className="w-full bg-white/5 hover:bg-primary text-gray-400 hover:text-dark-bg font-black text-xs uppercase tracking-widest py-4 rounded-2xl border border-white/10 hover:border-primary flex items-center justify-center gap-3 transition-all shadow-xl"
               >
                 <Download size={18} /> View Pulse Report
               </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reports;
