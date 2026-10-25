import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './ui/App';
import './ui/styles.css';
import './ui/v4.css';
import './ui/v5.css';
import './ui/v6.css';
import './ui/v7.css';
import './ui/v10.css';
import './ui/v11.css';
import './ui/v12.css';
import './ui/v13.css';
import './ui/v14.css';
import { registerOffline } from './offline/registerOffline';

const mount = document.getElementById('root');
if (!mount) throw new Error('No se encontró #root');
createRoot(mount).render(<React.StrictMode><App /></React.StrictMode>);
// El registro solo funciona en produccion y HTTPS (o localhost en Mac).
void registerOffline();
