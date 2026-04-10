import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import { Send, User as UserIcon, Phone, Video, Search, Mic, Paperclip, Camera, MoreHorizontal, Smile } from 'lucide-react';
import { API_URL } from '../config';

const Chat = () => {
  const { user, token } = useContext(AuthContext);
  const socket = useContext(SocketContext);
  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [tab, setTab] = useState('messages'); // 'messages' or 'sessions'
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!socket) return;
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
    return () => {
      socket.off("typing");
      socket.off("stop typing");
    };
  }, [socket]);

  useEffect(() => {
    if (!socket || !activeContact) return;
    
    const handleMessageReceived = (newMessageReceived) => {
      // Check if the message belongs to the active conversation
      const senderId = newMessageReceived.sender._id || newMessageReceived.sender;
      if (activeContact._id === senderId || activeContact._id === newMessageReceived.receiver) {
        setMessages(prev => [...prev, newMessageReceived]);
      }
    };

    socket.on("message received", handleMessageReceived);
    return () => socket.off("message received", handleMessageReceived);
  }, [socket, activeContact]);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await fetch(`${API_URL}/chat/contacts`, {
           headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setContacts(data);
        if (data.length > 0 && !activeContact) setActiveContact(data[0]);
      } catch (err) {
        console.error("Failed to fetch contacts", err);
      }
    };
    fetchContacts();
  }, [token, activeContact]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeContact) return;
      try {
        const res = await fetch(`${API_URL}/chat/${activeContact._id}`, {
           headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setMessages(data);
        if (socket) socket.emit("join chat", activeContact._id);
      } catch (err) {
        console.error("Failed to fetch messages", err);
      }
    };
    fetchMessages();
  }, [activeContact, token, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault();
      if (!newMessage) return;
      socket.emit("stop typing", activeContact._id);
      const payload = { sender: user._id, receiver: activeContact._id, content: newMessage };
      socket.emit("new message", payload);
      setMessages([...messages, { ...payload, sender: user, receiver: activeContact, createdAt: new Date().toISOString() }]);
      setNewMessage("");
    }
  };

  const typingHandler = (e) => {
    setNewMessage(e.target.value);
    if (!socket) return;
    if (!typing) {
      setTyping(true);
      socket.emit("typing", activeContact._id);
    }
    let lastTypingTime = new Date().getTime();
    setTimeout(() => {
      if (new Date().getTime() - lastTypingTime >= 3000 && typing) {
        socket.emit("stop typing", activeContact._id);
        setTyping(false);
      }
    }, 3000);
  };

  return (
    <div className="absolute inset-0 flex overflow-hidden">
      
      {/* Sidebar: Conversations */}
      <div className={`w-full md:w-96 border-r border-white/5 flex flex-col bg-dark-bg/30 backdrop-blur-3xl ${activeContact ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
             <h2 className="text-2xl font-extrabold text-white tracking-tight">Messages</h2>
             <button className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                <MoreHorizontal size={20} className="text-gray-400" />
             </button>
          </div>
          
          <div className="flex bg-white/5 rounded-xl p-1">
             <button onClick={() => setTab('messages')} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${tab === 'messages' ? 'bg-primary text-dark-bg shadow-lg' : 'text-gray-500 hover:text-white'}`}>Messages</button>
             <button onClick={() => setTab('sessions')} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${tab === 'sessions' ? 'bg-primary text-dark-bg shadow-lg' : 'text-gray-500 hover:text-white'}`}>Sessions</button>
          </div>

          <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
             <input type="text" placeholder="Search direct messages..." className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:border-primary/50 outline-none transition-all" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-1 custom-scrollbar">
          {contacts.map(contact => (
            <button
              key={contact._id}
              onClick={() => setActiveContact(contact)}
              className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all group ${activeContact?._id === contact._id ? 'bg-primary/10 border border-primary/20' : 'hover:bg-white/5 border border-transparent'}`}
            >
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-lg border border-primary/20">
                   {contact.name.charAt(0)}
                </div>
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-[3px] border-dark-bg"></span>
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex justify-between items-start mb-0.5">
                  <h3 className="text-sm font-bold text-white truncate">{contact.name}</h3>
                  <span className="text-[10px] font-bold text-gray-500">04:00PM</span>
                </div>
                <p className="text-xs text-gray-400 truncate group-hover:text-gray-300 transition-colors">
                   Good Morning Dear Sir! I am {user.role === 'Doctor' ? 'checking' : 'referring'}...
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      {activeContact ? (
        <div className="flex-1 flex flex-col bg-white/[0.01] relative">
          
          {/* Main Chat Header */}
          <header className="h-20 border-b border-white/5 px-6 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
               <button onClick={() => setActiveContact(null)} className="md:hidden p-2 text-gray-400 hover:text-white">←</button>
               <div className="relative">
                  <div className="w-11 h-11 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                     <UserIcon size={22} />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-dark-bg"></span>
               </div>
               <div>
                  <h3 className="font-bold text-white leading-tight">{activeContact.name}</h3>
                  <span className="text-[10px] font-bold text-primary uppercase tracking-tighter">Online</span>
               </div>
            </div>
            <div className="flex items-center gap-4">
               <span className="hidden sm:inline-flex px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold text-gray-500 uppercase tracking-widest">Yesterday</span>
               <button className="p-2 text-gray-400 hover:text-white transition-colors"><MoreHorizontal size={20} /></button>
            </div>
          </header>

          {/* Messages Grid */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar relative">
             <div className="absolute top-[15%] right-[10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>

             {messages.map((msg, i) => {
                const isMe = msg.sender._id === user._id || msg.sender === user._id;
                return (
                  <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                    <div className={`max-w-[75%] md:max-w-[60%] space-y-1`}>
                       <div className={`p-4 px-6 rounded-3xl shadow-xl leading-relaxed text-sm ${isMe ? 'bg-primary text-black rounded-tr-sm font-medium' : 'bg-white/5 border border-white/10 text-white rounded-tl-sm'}`}>
                          {msg.content}
                       </div>
                       <div className={`flex items-center gap-2 text-[10px] font-bold px-2 ${isMe ? 'flex-row-reverse text-primary' : 'text-gray-500'}`}>
                          <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                       </div>
                    </div>
                  </div>
                );
             })}
             {isTyping && (
                <div className="flex justify-start">
                   <div className="flex bg-white/5 rounded-full px-5 py-3 gap-1.5 border border-white/10">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-150"></span>
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-300"></span>
                   </div>
                </div>
             )}
             <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-6 md:p-8 shrink-0">
             <div className="max-w-4xl mx-auto flex items-center gap-3 bg-white/5 border border-white/10 p-2 pl-4 rounded-[2.5rem] shadow-2xl backdrop-blur-xl">
                 <button className="p-2 text-gray-500 hover:text-white transition-colors"><Smile size={22}/></button>
                 <input 
                   type="text" 
                   value={newMessage}
                   onChange={typingHandler}
                   onKeyDown={sendMessage}
                   placeholder="Type a Message"
                   className="flex-1 bg-transparent border-none text-white text-sm focus:ring-0 outline-none"
                 />
                 <div className="flex items-center gap-1">
                    <button className="p-2.5 text-gray-500 hover:text-white transition-colors bg-white/5 rounded-full"><Mic size={20}/></button>
                    <button className="p-2.5 text-gray-500 hover:text-white transition-colors bg-white/5 rounded-full"><Paperclip size={20}/></button>
                    <button className="p-2.5 text-gray-500 hover:text-white transition-colors bg-white/5 rounded-full hidden sm:block"><Camera size={20}/></button>
                    <button onClick={sendMessage} className="p-3 bg-primary text-dark-bg rounded-full ml-1 shadow-lg hover:scale-105 active:scale-95 transition-all">
                       <Send size={20} fill="currentColor" />
                    </button>
                 </div>
             </div>
          </div>

        </div>
      ) : (
        <div className="hidden md:flex flex-1 flex-col items-center justify-center p-8 bg-black/20">
           <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center border border-white/10 mb-6 group cursor-pointer hover:scale-110 transition-transform">
              <MessageSquare size={40} className="text-gray-600 group-hover:text-primary transition-colors" />
           </div>
           <h2 className="text-3xl font-extrabold text-white mb-2">Pulse Messaging</h2>
           <p className="text-gray-400 text-center max-w-sm">Seamlessly connect with your health partners. Your messages are encrypted pulse by pulse.</p>
        </div>
      )}

    </div>
  );
};

const MessageSquare = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
);

export default Chat;
