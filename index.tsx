import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Buffer } from 'buffer/'; // Ensure Buffer is imported if used globally

// Polyfill Buffer for browser environment if not already available
// This is important for some Solana libraries or their dependencies.
if (typeof window !== 'undefined' && typeof window.Buffer === 'undefined') {
  window.Buffer = Buffer as any;
}

// Simulate process.env if it doesn't exist (e.g., in a plain browser environment without a build tool)
// @ts-ignore
if (typeof process === 'undefined') {
  // @ts-ignore
  process = { env: {} };
} else if (typeof process.env === 'undefined') {
  // @ts-ignore
  process.env = {};
}

// Check for API_KEY. The application relies on this being set in the environment.
// @ts-ignore
if (!process.env.API_KEY) {
  console.warn(
    `API_KEY not found in process.env. SLASHAI requires process.env.API_KEY to be set 
    to a valid Google Gemini API key for image generation to function.
    Please ensure this environment variable is configured in your deployment 
    environment or when running locally.`
  );
  // IMPORTANT: Do NOT set a default or placeholder API_KEY here.
  // The application must assume it's provided as per project guidelines.
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