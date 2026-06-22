// EduBridge frontend entry point
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppRouter from './router.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import InstallPrompt from './components/InstallPrompt.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
        <InstallPrompt />
        <Toaster position="top-center" toastOptions={{ style: { fontFamily: 'Inter, sans-serif' } }} />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
