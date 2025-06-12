// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Optional: สำหรับ CSS ทั่วไปของคุณ
import App from './App';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme/theme'; // นำเข้า theme ที่เราสร้าง

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* ใช้ ThemeProvider เพื่อให้ Component ของ MUI สามารถเข้าถึง Theme ได้ */}
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);