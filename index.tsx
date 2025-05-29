import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Buffer } from 'buffer/';

if (typeof window !== 'undefined' && typeof window.Buffer === 'undefined') {
  window.Buffer = Buffer as any;
}

// Bu kısım kaldırıldı:
// process tanımlamaya gerek yok, Vite ortamında import.meta.env kullanılır

if (!import.meta.env.VITE_GEMINI_API_KEY) {
  console.warn(
    `VITE_GEMINI_API_KEY is not defined in import.meta.env. Please define it in your .env file or Vercel environment settings.`
  );
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
