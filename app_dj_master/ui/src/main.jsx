import React from 'react';
import { createRoot } from 'react-dom/client';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import App from './App.jsx';
import './styles.css';

document.documentElement.classList.add('dark');

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <TooltipProvider delayDuration={350}><App /></TooltipProvider>
  </React.StrictMode>,
);
