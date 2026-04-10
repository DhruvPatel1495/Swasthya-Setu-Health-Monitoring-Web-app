import { getIO } from '../config/socket.js';

export const emitVitalsUpdate = (patientId, vitalsData) => {
  const io = getIO();
  io.emit(`vitals-${patientId}`, vitalsData);
};

export const emitAlert = (patientId, alertData) => {
  const io = getIO();
  io.emit(`alert-${patientId}`, alertData);
  io.emit('admin-alerts', { patientId, ...alertData });
};
