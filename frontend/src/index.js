// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // << MUDE AQUI

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App /> {/* << E AQUI */}
  </React.StrictMode>
);