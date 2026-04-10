import React, { useState, useRef, useEffect, useContext } from 'react';
import { API_URL } from '../../config';
import { Bot, X, Send, Loader2, Sparkles, MessageCircle } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

export const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your Swasthya Setu health assistant. How can I help you with your queries today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { token, user } = useContext(AuthContext);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || !token) return;

    const userMessage = { role: 'user', content: input };
    const newMsgs = [...messages, userMessage];
    setMessages(newMsgs);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/aichat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          message: input, 
          history: newMsgs.filter(m => m.role !== 'system') 
        })
      });
      const data = await res.json();
      setMessages([...newMsgs, { role: 'assistant', content: data.reply }]);
    } catch (e) {
      setMessages([...newMsgs, { role: 'assistant', content: 'Sorry, I am having trouble connecting right now. Please try again pulse by pulse.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) return null;

  return (
    <>
      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-8 right-8 w-16 h-16 bg-primary text-dark-bg rounded-2xl flex items-center justify-center shadow-[0_8px_30px_rgba(0,242,254,0.3)] hover:scale-110 active:scale-95 transition-all z-50 group ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <div className="absolute inset-0 bg-white/20 rounded-2xl animate-ping opacity-20 group-hover:hidden"></div>
        <Bot size={32} className="group-hover:rotate-12 transition-transform" />
      </button>

      {/* Chat Window */}
      <div className={`fixed bottom-8 right-8 w-[22rem] md:w-[26rem] glass-card border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5)] z-50 flex flex-col transition-all origin-bottom-right duration-500 overflow-hidden ${isOpen ? 'scale-100 opacity-100 h-[36rem]' : 'scale-0 opacity-0 h-0 pointer-events-none'}`}>
        
        {/* Header */}
        <header className="bg-white/5 border-b border-white/10 p-5 flex justify-between items-center relative overflow-hidden shrink-0">
           <div className="absolute top-0 left-0 w-full h-full bg-primary/5 blur-3xl -z-10"></div>
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary border border-primary/30 shadow-inner">
                 <Bot size={22}/>
              </div>
              <div>
                 <h3 className="font-black text-white text-sm uppercase tracking-widest leading-none">Swasthya <span className="text-primary">AI</span></h3>
                 <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-primary uppercase tracking-tighter">
                   <div className="w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_rgba(0,242,254,0.5)]"></div> Online Assistant
                 </div>
              </div>
           </div>
           <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/5 rounded-xl text-gray-500 hover:text-white transition-all"><X size={20}/></button>
        </header>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col custom-scrollbar bg-dark-bg/20">
          <div className="text-center py-4">
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 bg-white/5 px-4 py-1 rounded-full border border-white/5">Secured Pulse Connection</span>
          </div>
          
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`max-w-[85%] flex flex-col gap-1.5 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`p-4 rounded-2xl text-xs font-medium leading-relaxed shadow-xl border ${
                  m.role === 'user' 
                    ? 'bg-primary text-dark-bg rounded-br-sm border-primary/20' 
                    : 'bg-white/5 text-gray-200 rounded-bl-sm border-white/10 backdrop-blur-md'
                }`}>
                  {m.content}
                </div>
                <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest px-1">
                   {m.role === 'user' ? user?.name : 'Assistant'}
                </span>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
               <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl rounded-bl-sm backdrop-blur-md">
                 <div className="flex gap-1.5">
                    <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce delay-150"></span>
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-300"></span>
                 </div>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-5 bg-white/5 border-t border-white/10 shrink-0">
           <div className="relative group">
              <input 
                type="text"
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-12 py-4 text-sm text-white placeholder:text-gray-600 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all shadow-inner"
                placeholder="Ask me anything about your health..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
              />
              <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within:text-primary transition-colors" size={18} />
              <button 
                onClick={handleSend} 
                disabled={isLoading || !input.trim()} 
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-primary text-dark-bg rounded-xl hover:scale-110 disabled:opacity-30 disabled:scale-100 transition-all shadow-lg active:scale-95"
              >
                <Send size={18} fill="currentColor" />
              </button>
           </div>
           <p className="text-[9px] text-center text-gray-600 mt-3 font-bold uppercase tracking-widest">Powered by PulseAI • GROQ Engine</p>
        </div>

      </div>
    </>
  );
};
