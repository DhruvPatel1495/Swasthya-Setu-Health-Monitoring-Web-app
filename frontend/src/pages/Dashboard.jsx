import React, { useContext, useEffect, useState, useRef } from 'react';
import { API_URL } from '../config';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import { PatientDashboard } from '../components/dashboard/PatientDashboard';
import { DoctorDashboard } from '../components/dashboard/DoctorDashboard';

const Dashboard = () => {
  const { user, token } = useContext(AuthContext);
  const socket = useContext(SocketContext);
  
  const [vitalsData, setVitalsData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [latestAI, setLatestAI] = useState("AI is monitoring your vitals in real-time...");
  const [simData, setSimData] = useState([]);
  const dataRef = useRef([]); 
  const simIndexRef = useRef(0);
  
  const patientId = user?._id;

  // Fetch simulation data from CSV
  useEffect(() => {
    if (user?.role !== 'Patient') return;
    const fetchCSV = async () => {
      try {
        const response = await fetch('/vitals_sim_data.csv');
        if (!response.ok) throw new Error('CSV not found');
        const text = await response.text();
        const rows = text.split('\n').slice(1).filter(row => row.trim());
        const parsed = rows.map(row => {
          const [hr, temp, spo2, label] = row.split(',');
          return { heartRate: Number(hr), temperature: Number(temp), spo2: Number(spo2), label };
        });
        console.log("Loaded Simulation Data:", parsed.length, "rows");
        setSimData(parsed);
      } catch (err) {
        console.error("Failed to load simulation CSV", err);
      }
    };
    fetchCSV();
  }, [user?.role]);

  useEffect(() => {
    if (!socket || user?.role !== 'Patient') return;

    console.log("Setting up socket listeners for ID:", patientId);

    socket.on(`vitals-${patientId}`, (data) => {
      console.log("Received Vitals Data via Socket:", data);
      const timeStr = new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const newDataPoint = {
        time: timeStr,
        heartRate: data.heartRate,
        temperature: data.temperature,
        spo2: data.spo2,
      };

      dataRef.current = [...dataRef.current.slice(-19), newDataPoint]; 
      setVitalsData([...dataRef.current]);

      if (data.aiAnalysis && data.aiAnalysis !== "Normal vitals, no detailed analysis required.") {
         setLatestAI(data.aiAnalysis);
      }
    });

    socket.on(`alert-${patientId}`, (data) => {
      console.log("Received Alert via Socket:", data);
      setAlerts(prev => [{ id: Date.now(), ...data }, ...prev].slice(0, 5));
    });

    return () => {
      socket.off(`vitals-${patientId}`);
      socket.off(`alert-${patientId}`);
    };
  }, [socket, patientId, user?.role]);

  useEffect(() => {
    if (user?.role !== 'Patient' || simData.length === 0) return;
    
    console.log("Starting health simulation with 5s interval...");
    const interval = setInterval(async () => {
      const currentSim = simData[simIndexRef.current];
      simIndexRef.current = (simIndexRef.current + 1) % simData.length;
      
      console.log("Posting simulated vitals to backend:", currentSim.label);
      try {
        const res = await fetch(`${API_URL}/patient/data`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ 
            patientId, 
            heartRate: currentSim.heartRate, 
            temperature: currentSim.temperature, 
            spo2: currentSim.spo2 
          })
        });
        if (!res.ok) console.log("Backend error on telemetry post:", res.status);
      } catch (e) {
        console.log("Data simulation POST failed", e.message);
      }
    }, 5000); 

    return () => clearInterval(interval);
  }, [patientId, token, user?.role, simData]);

  return (
    <div className="absolute inset-0 overflow-y-auto px-4 md:px-8 py-8 custom-scrollbar">
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Good Morning, <span className="text-primary">{user?.name}</span></h1>
          <p className="text-gray-400 mt-1">Here is what is happening with your health profile today.</p>
        </div>

        {user?.role === 'Doctor' ? (
          <DoctorDashboard user={user} token={token} socket={socket} />
        ) : (
          <PatientDashboard 
            user={user} 
            token={token} 
            socket={socket} 
            vitalsData={vitalsData} 
            alerts={alerts} 
            latestAI={latestAI} 
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;

