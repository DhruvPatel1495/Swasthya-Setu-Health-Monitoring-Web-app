import React, { useState, useContext } from 'react';
import { API_URL } from '../config';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Patient');
  const [error, setError] = useState(null);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      
      login({ _id: data._id, name: data.name, email: data.email, role: data.role }, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-accent/20 rounded-full blur-3xl"></div>
      
      <Card className="w-full max-w-md z-10">
        <div className="text-center mb-10">
          <img src="/logo.svg" alt="Swasthya Setu" className="h-28 mx-auto" />
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-sm text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Full Name" 
            type="text" 
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input 
            label="Email Address" 
            type="email" 
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input 
            label="Password" 
            type="password" 
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="flex flex-col gap-2">
             <label className="text-sm font-medium text-gray-400">Account Role</label>
             <select 
               value={role} 
               onChange={(e) => setRole(e.target.value)}
               className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white focus:border-primary outline-none"
             >
               <option value="Patient">Patient</option>
               <option value="Doctor">Doctor</option>
             </select>
          </div>
          
          <Button type="submit" className="w-full mt-4">Sign Up</Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account? <Link to="/login" className="text-primary hover:underline">Sign In</Link>
        </p>
      </Card>
    </div>
  );
};

export default Register;
