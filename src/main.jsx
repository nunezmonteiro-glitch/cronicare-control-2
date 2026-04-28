import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Polyfill para window.storage (usando localStorage no ambiente real)
window.storage = {
  get: async (key) => {
    try {
      const value = localStorage.getItem(key);
      if (value === null) throw new Error('not found');
      return { key, value };
    } catch (e) { throw e; }
  },
  set: async (key, value) => {
    try {
      localStorage.setItem(key, value);
      return { key, value };
    } catch (e) { return null; }
  },
  delete: async (key) => {
    try {
      localStorage.removeItem(key);
      return { key, deleted: true };
    } catch (e) { return null; }
  },
  list: async (prefix) => {
    const keys = Object.keys(localStorage).filter(k => !prefix || k.startsWith(prefix));
    return { keys };
  }
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
