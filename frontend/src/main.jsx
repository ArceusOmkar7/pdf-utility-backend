import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Assuming your main App component is in App.jsx/js
import './index.css'; // Or your main CSS file

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);