import React from 'react';
import ReactDOM from 'react-dom/client';
import './assets/css/index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import "./assets/css/main.min.css";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <html data-bs-theme="dark" className="bg-dark">
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </html>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log);
