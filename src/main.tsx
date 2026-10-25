import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';
import { api } from './lib/api';

// Expose API for browser diagnostic harness and latency benchmarking
if (typeof window !== 'undefined') {
  (window as unknown as { unilisticsApi: typeof api }).unilisticsApi = api;
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find root element');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

