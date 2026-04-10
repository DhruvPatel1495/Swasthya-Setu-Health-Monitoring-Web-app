import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Appointments from './pages/Appointments';
import Marketplace from './pages/Marketplace';
import DoctorProfile from './pages/DoctorProfile';
import Chat from './pages/Chat';
import LandingPage from './pages/LandingPage';
import { Navbar } from './components/layout/Navbar';
import { AIChatbot } from './components/layout/AIChatbot';

const AppLayout = ({ children, onLogout }) => (
  <div className="min-h-screen bg-dark-bg text-gray-100 flex flex-col font-sans">
    <Navbar onLogout={onLogout} />
    <main className="flex-1 relative">
       {children}
    </main>
    <AIChatbot />
  </div>
);

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

export const RoleRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

function App() {
  const { user, logout } = useContext(AuthContext);

  return (
    <Router>
      <Routes>
        {/* Guest / Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected System Wrapper */}
        <Route path="/dashboard/*" element={
          <ProtectedRoute>
            <AppLayout onLogout={logout}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="patients" element={
                  <RoleRoute allowedRoles={['Doctor', 'Admin']}>
                    <Patients />
                  </RoleRoute>
                } />
                <Route path="marketplace" element={
                  <RoleRoute allowedRoles={['Patient', 'Admin']}>
                    <Marketplace />
                  </RoleRoute>
                } />
                <Route path="doctor/:id" element={
                  <RoleRoute allowedRoles={['Patient', 'Admin']}>
                    <DoctorProfile />
                  </RoleRoute>
                } />
                <Route path="messages" element={<Chat />} />
                <Route path="reports" element={<Reports />} />
                <Route path="settings" element={<Settings />} />
                <Route path="appointments" element={<Appointments />} />
                <Route path="*" element={<Navigate to="/dashboard" />} />
              </Routes>
            </AppLayout>
          </ProtectedRoute>
        } />

        {/* Catch-all for legacy path and dashboard entry */}
        <Route path="/app/*" element={<Navigate to="/dashboard" />} />
        
        {/* Default redirect for authenticated root hit */}
        <Route path="*" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
