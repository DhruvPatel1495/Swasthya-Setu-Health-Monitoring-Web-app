const API_URL = import.meta.env.MODE === 'development' 
  ? '/api' 
  : '/api';

const SOCKET_URL = import.meta.env.MODE === 'development'
  ? '' // Empty string defaults socket.io to window.location which goes through Vite proxy
  : window.location.origin;

export { API_URL, SOCKET_URL };
