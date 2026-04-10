import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { API_URL } from '../config';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';

const Login = () => {
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
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');

      login({ 
        _id: data._id, 
        profileId: data.profileId, 
        name: data.name, 
        email: data.email, 
        role: data.role 
      }, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg p-4 relative overflow-hidden">
      {/* Animated Heart Pulse Background */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.07] z-0 overflow-hidden">
        <svg width="200%" height="100%" viewBox="0 0 1000 400" preserveAspectRatio="none" className="animate-pulse-scroll">
          <path
            d="M0 200 H200 L220 120 L245 280 L275 60 L305 200 H500 M500 200 H700 L720 120 L745 280 L775 60 L805 200 H1000"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-pulse-scroll {
          animation: pulse-scroll 15s linear infinite;
        }
      `}} />

      {/* Decorative blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-accent/20 rounded-full blur-3xl"></div>


      <Card className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <div className="text-center mb-10">
            <img src="/logo.svg" alt="Swasthya Setu" className="h-28 mx-auto" />
          </div>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-sm text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <label className="text-sm font-medium text-gray-400">Login As</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white focus:border-primary outline-none"
            >
              <option value="Patient">Patient</option>
              <option value="Doctor">Doctor</option>
            </select>
          </div>

          <Button type="submit" className="w-full mt-4">Sign In</Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Don't have an account? <Link to="/register" className="text-primary hover:underline">Register here</Link>
        </p>
      </Card>
    </div>
  );
};

export default Login;
