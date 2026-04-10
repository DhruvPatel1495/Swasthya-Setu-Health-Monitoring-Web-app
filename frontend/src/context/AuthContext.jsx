import React, { createContext, useState, useEffect } from 'react';
import { API_URL } from '../config';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const storedUser = localStorage.getItem('user');
  const storedToken = localStorage.getItem('token');

  const [user, setUser] = useState(storedUser ? JSON.parse(storedUser) : null);
  const [token, setToken] = useState(storedToken || null);
  const [loading, setLoading] = useState(!!storedToken); // only show loading if there's a token to validate

  useEffect(() => {
    const validateToken = async () => {
      if (!storedToken) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { 'Authorization': `Bearer ${storedToken}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
          localStorage.setItem('user', JSON.stringify(data));
        } else {
          // Token is invalid/expired — clear everything
          setUser(null);
          setToken(null);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      } catch (e) {
        // Network error — keep the cached user so the app still works
        console.warn('Could not validate token (network error). Using cached user.');
      } finally {
        setLoading(false);
      }
    };
    validateToken();
  }, []);  // only run once on mount

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', authToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {loading ? (
        <div className="min-h-screen bg-dark-bg flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            <p className="text-gray-400 text-sm">Loading Swasthya Setu...</p>
          </div>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
};
