import React, { useState, useEffect, useContext } from 'react';
import { API_URL } from '../config';
import { AuthContext } from '../context/AuthContext';
import { Search, Star, MapPin, Clock, Filter, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Marketplace = () => {
  const { token } = useContext(AuthContext);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await fetch(`${API_URL}/doctors`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setDoctors(data);
      } catch (e) {
        console.error("Error fetching doctors", e);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, [token]);

  const categories = ["All", "General Health", "Cardiology", "Neurology", "Psychiatry", "Pediatrics"];

  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch = doc.userId?.name.toLowerCase().includes(search.toLowerCase()) || doc.specialization.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "All" || doc.specialization === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Find Doctors</h2>
          <p className="text-gray-400">Book an appointment with top-rated medical professionals.</p>
        </div>
        
        <div className="relative w-full md:w-80 group">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={18} />
           <input 
             type="text" 
             placeholder="Search by name or specialty..."
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm text-white focus:border-primary outline-none transition-all shadow-xl"
           />
        </div>
      </div>

      {/* Categories */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide">
        <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-widest mr-2 leading-none">
           <Filter size={14} className="text-primary"/> Filters:
        </div>
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`whitespace-nowrap px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border ${categoryFilter === cat ? 'bg-primary text-dark-bg border-primary shadow-lg shadow-primary/20 scale-105' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/20'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
               <div key={i} className="h-72 bg-white/5 rounded-3xl animate-pulse border border-white/5"></div>
            ))}
         </div>
      ) : filteredDoctors.length === 0 ? (
         <div className="text-center py-24 glass-card border-white/5 rounded-[2.5rem]">
           <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/10">
              <Search size={32} className="text-gray-600" />
           </div>
           <h3 className="text-xl font-bold text-white mb-2">No doctors found</h3>
           <p className="text-gray-400 max-w-sm mx-auto">Try adjusting your filters or search terms to find the right specialist.</p>
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDoctors.map(doc => (
            <div key={doc._id} className="glass-card p-6 flex flex-col group hover:border-primary/40 transition-all duration-500 hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-10 group-hover:bg-primary/10 transition-colors"></div>
              
              <div className="flex justify-between items-start mb-6">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 text-primary flex items-center justify-center text-2xl font-bold group-hover:scale-110 group-hover:bg-primary group-hover:text-dark-bg transition-all duration-300">
                  {doc.userId?.name.charAt(0)}
                </div>
                <div className="flex items-center gap-1.5 bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-xl text-xs font-black border border-yellow-500/20">
                   <Star size={12} className="fill-yellow-500" /> {doc.rating.toFixed(1)}
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{doc.userId?.name}</h3>
              <p className="text-primary/70 font-black text-[10px] uppercase tracking-[0.2em] mb-4 mt-1">{doc.specialization}</p>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-gray-400 text-xs font-medium">
                  <Clock size={16} className="text-gray-600" /> {doc.experience} Years Experience
                </div>
                <div className="flex items-center gap-3 text-gray-400 text-xs font-medium">
                  <MapPin size={16} className="text-gray-600" /> {doc.languages.join(', ')}
                </div>
              </div>

              <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-5">
                <div className="flex flex-col">
                   <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Rate</span>
                   <span className="text-white font-black text-xl">₹{doc.pricing}<span className="text-gray-500 text-xs font-medium">/hr</span></span>
                </div>
                <Link to={`/doctor/${doc._id}`} className="p-3 bg-white/5 hover:bg-primary text-gray-400 hover:text-dark-bg rounded-2xl transition-all duration-300 group/btn shadow-xl">
                  <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Marketplace;
