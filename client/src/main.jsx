import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import React from 'react';
import ReactDOM from 'react-dom/client';
import pwaUtils from './utils/pwa.js';

// Render animated dots background outside the app root
if (!document.getElementById('animated-dots-bg')) {
  const bgDiv = document.createElement('div');
  bgDiv.id = 'animated-dots-bg';
  bgDiv.className = 'animated-dots-bg';
  // Generate many dots with random positions and delays
  for (let i = 0; i < 36; i++) {
    const dot = document.createElement('div');
    dot.className = `animated-dot ${i % 2 === 0 ? 'yellow' : 'white'}`;
    dot.style.left = `${Math.random() * 100}vw`;
    dot.style.top = `${Math.random() * 100}vh`;
    dot.style.animationDelay = `${Math.random() * 6}s`;
    bgDiv.appendChild(dot);
  }
  document.body.appendChild(bgDiv);
}
// Render a second layer of animated dots further in the background
if (!document.getElementById('animated-dots-bg2')) {
  const bgDiv2 = document.createElement('div');
  bgDiv2.id = 'animated-dots-bg2';
  bgDiv2.className = 'animated-dots-bg2';
  for (let i = 0; i < 56; i++) {
    const dot = document.createElement('div');
    dot.className = `animated-dot2 ${i % 2 === 0 ? 'yellow' : 'white'}`;
    dot.style.left = `${Math.random() * 100}vw`;
    dot.style.top = `${Math.random() * 100}vh`;
    dot.style.animationDelay = `${Math.random() * 10}s`;
    bgDiv2.appendChild(dot);
  }
  document.body.appendChild(bgDiv2);
}

// Initialize PWA
pwaUtils.init().then(() => {
  console.log('PWA initialized successfully');
}).catch((error) => {
  console.error('PWA initialization failed:', error);
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
