const API_URL = import.meta.env.MODE === 'development' 
  ? 'http://127.0.0.1:5000/api' 
  : '/api';

const SOCKET_URL = import.meta.env.MODE === 'development'
  ? 'http://127.0.0.1:5000'
  : window.location.origin;

export { API_URL, SOCKET_URL };
