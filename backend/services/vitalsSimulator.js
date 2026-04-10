import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Patient from '../models/Patient.js';
import Vitals from '../models/Vitals.js';
import { emitVitalsUpdate } from './socketService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CSV_PATH = path.join(__dirname, '../data/vitals_sim_data.csv');

let csvData = [];

export const initVitalsSimulator = async () => {
  try {
    // 1. Load CSV Data
    if (fs.existsSync(CSV_PATH)) {
      const content = fs.readFileSync(CSV_PATH, 'utf-8');
      const lines = content.split('\n').filter(line => line.trim() !== '');
      const headers = lines[0].split(',');
      
      csvData = lines.slice(1).map(line => {
        const values = line.split(',');
        return {
          heartRate: parseInt(values[0]),
          temperature: parseFloat(values[1]),
          spo2: parseInt(values[2]),
          label: values[3]
        };
      });
      console.log(`Vitals Simulator: Loaded ${csvData.length} data points from CSV.`);
    } else {
      console.error('Vitals Simulator: CSV file not found at', CSV_PATH);
      // Fallback data if CSV missing
      csvData = [
        { heartRate: 72, temperature: 36.6, spo2: 98 },
        { heartRate: 85, temperature: 37.1, spo2: 97 },
        { heartRate: 110, temperature: 37.5, spo2: 95 }
      ];
    }

    // 2. Start Simulation Loop
    let dataIndex = 0;
    setInterval(async () => {
      try {
        const patients = await Patient.find().populate('userId');
        if (patients.length === 0) return;

        const currentData = csvData[dataIndex];
        
        for (const patient of patients) {
          if (!patient.userId) continue;

          // Randomize slightly to make it look real
          const hr = currentData.heartRate + Math.floor(Math.random() * 5 - 2);
          const temp = currentData.temperature + (Math.random() * 0.4 - 0.2);
          const spo2 = Math.min(100, currentData.spo2 + Math.floor(Math.random() * 2 - 1));

          const vitals = {
            patientId: patient._id,
            heartRate: hr,
            temperature: parseFloat(temp.toFixed(1)),
            spo2: spo2,
            timestamp: new Date()
          };

          // Broadcast update using User ID (as frontend listens for this)
          emitVitalsUpdate(patient.userId._id.toString(), vitals);
          
          // Optional: Save to DB periodically (every 5th step to avoid bloating)
          if (dataIndex % 5 === 0) {
             await Vitals.create(vitals);
          }
        }

        dataIndex = (dataIndex + 1) % csvData.length;
      } catch (err) {
        console.error('Vitals Simulation Tick Error:', err.message);
      }
    }, 3000); // Update every 3 seconds

  } catch (error) {
    console.error('Vitals Simulator Initialization Error:', error.message);
  }
};
