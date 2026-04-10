import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Shield, Calendar, Heart, Brain, Users, ArrowRight, Star, Globe, Zap, MessageSquare } from 'lucide-react';
import Hero3D from '../components/Hero3D';

const LandingPage = () => {

  return (
    <div className="min-h-screen bg-dark-bg text-gray-100 font-sans overflow-x-hidden">
      {/* Navbar (Guest version) */}
      <nav className="h-20 px-8 flex items-center justify-between border-b border-white/5 bg-dark-bg/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="Swasthya Setu" className="h-14 md:h-16 w-auto object-contain" />
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
          <a href="#about" className="hover:text-white transition-colors">About</a>
          <a href="#services" className="hover:text-white transition-colors">Services</a>
          <a href="#team" className="hover:text-white transition-colors">Team</a>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="px-5 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">Login</Link>
          <Link to="/register" className="px-6 py-2 bg-primary text-dark-bg rounded-full text-sm font-bold shadow-[0_0_20px_rgba(0,242,254,0.3)] hover:scale-105 transition-all">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-8">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2"></div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-primary text-xs font-bold uppercase tracking-widest">
              <Zap size={14} /> AI-Powered Health Monitoring
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tighter">
              Medical Services <br />
              <span className="text-gradient">Personalized</span> <br />
              for Better Health
            </h1>
            <p className="text-xl text-gray-400 max-w-lg leading-relaxed">
              Experience the future of healthcare with Swasthya Setu. Real-time vitals tracking, AI-driven diagnostics, and instant consultations from the comfort of your home.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/register" className="px-8 py-4 bg-primary text-dark-bg rounded-2xl font-bold flex items-center gap-2 shadow-xl hover:scale-105 transition-all">
                Get Started <ArrowRight size={20} />
              </Link>
              <a href="#services" className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition-all">
                Explore Services
              </a>
            </div>
          </div>
          <div className="relative animate-in fade-in zoom-in duration-1000">
            {/* Ambient glow behind the 3D scene */}
            <div className="absolute -inset-8 bg-primary/10 rounded-full blur-[80px] -z-10" />
            <div className="absolute -inset-4 bg-violet-500/5 rounded-full blur-[60px] -z-10" />
            {/* 3D Canvas container */}
            <div style={{ width: '100%', aspectRatio: '1 / 1', minHeight: '420px' }}>
              <Hero3D />
            </div>
          </div>
        </div>
      </section>

      {/* Partners / Recognized By */}
      <section className="py-12 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-8">
          <p className="text-center text-xs font-bold text-gray-500 uppercase tracking-widest mb-8">Recognized and Trusted By</p>
          <div className="flex flex-wrap justify-center gap-12 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
             <span className="text-xl font-bold">HEALTHCORE</span>
             <span className="text-xl font-bold">MEDTECH</span>
             <span className="text-xl font-bold">BIOLINK</span>
             <span className="text-xl font-bold">VITA-LIFE</span>
             <span className="text-xl font-bold">NEURO-X</span>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-8 max-w-7xl mx-auto text-center">
        <h2 className="text-accent text-sm font-bold uppercase tracking-widest mb-4">About</h2>
        <p className="text-4xl md:text-5xl font-bold max-w-4xl mx-auto leading-tight">
          Our team of highly <span className="text-primary">experienced doctors</span> and <span className="text-accent">specialists are dedicated</span> to offering the best medical care tailored to your unique <span className="text-primary">needs</span>.
        </p>
      </section>

      {/* Services Grid */}
      <section id="services" className="py-24 px-8 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-primary text-sm font-bold uppercase tracking-widest">Service</h2>
            <h3 className="text-5xl font-bold">Discover Our Benefits & Services</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: MessageSquare, title: "24x7 Chats", desc: "Consult with specialists across the globe anytime." },
              { icon: Globe, title: "Secure Video Calls", desc: "End-to-end encrypted video and voice consultations." },
              { icon: Calendar, title: "Easy Appointments", desc: "Schedule appointments with specialists in clicks." },
              { icon: Brain, title: "Mental Health", desc: "Dedicated counseling and mindfulness programs." },
              { icon: Heart, title: "Vital Monitoring", desc: "Real-time tracking of your body metrics." },
              { icon: Shield, title: "Private & Secure", desc: "Your medical data is encrypted and protected." }
            ].map((s, idx) => (
              <div key={idx} className="glass-card p-8 group hover:-translate-y-2 transition-all">
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10 group-hover:bg-primary/20 group-hover:border-primary/40 transition-colors">
                  <s.icon className="text-primary" size={28} />
                </div>
                <h4 className="text-xl font-bold mb-3">{s.title}</h4>
                <p className="text-gray-400 leading-relaxed text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-24 px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-primary text-sm font-bold uppercase tracking-widest mb-4">Team</h2>
          <h3 className="text-5xl font-bold">Our Support Team, Ready for You</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {[
             { name: "Dr. Arun Kumar", role: "Cardiologist", img: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=2070" },
             { name: "Dr. Priya Sharma", role: "Psychologist", img: "/dr_priya_sharma.png" },
             { name: "Dr. Rohit Verma", role: "General Physician", img: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=2070" }
           ].map((d, idx) => (
             <div key={idx} className="relative group overflow-hidden rounded-[2.5rem] aspect-[3/4]">
                <img src={d.img} alt={d.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-transparent opacity-80"></div>
                <div className="absolute bottom-8 left-8">
                   <h4 className="text-2xl font-bold">{d.name}</h4>
                   <p className="text-primary text-sm font-semibold">{d.role}</p>
                </div>
             </div>
           ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-8 bg-primary/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-accent text-sm font-bold uppercase tracking-widest mb-4">Testimonials</h2>
            <h3 className="text-5xl font-bold">Voices That Trust Us</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {[1, 2, 3].map((_, idx) => (
               <div key={idx} className="glass-card p-8 space-y-4">
                  <div className="flex gap-1 text-yellow-500">
                    {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} fill="currentColor" />)}
                  </div>
                  <p className="text-gray-300 italic">"The real-time monitoring gave me peace of mind after my surgery. The team is incredibly responsive and caring."</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                     <div className="w-10 h-10 rounded-full bg-primary/20"></div>
                     <div>
                        <p className="font-bold text-white">Patient #{idx + 1}</p>
                        <p className="text-xs text-gray-500">Verified User</p>
                     </div>
                  </div>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-8 text-center max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-bold mb-8">
          Patients can consult with healthcare providers from the <span className="text-primary">comfort of their home</span>, eliminating travel time and costs.
        </h2>
        <Link to="/register" className="inline-flex items-center gap-2 px-10 py-5 bg-primary text-dark-bg rounded-2xl font-bold text-xl shadow-2xl hover:scale-105 transition-all">
          Get Started Now <ArrowRight size={24} />
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-black/20 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="Swasthya Setu" className="h-14 w-auto brightness-200 invert-[0.1]" />
          </div>
          <div className="flex gap-8 text-sm text-gray-500">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Contact Us</a>
          </div>
          <div className="flex gap-6">
            <Globe className="text-gray-500 hover:text-white cursor-pointer" size={20} />
            <Shield className="text-gray-500 hover:text-white cursor-pointer" size={20} />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
