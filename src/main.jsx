import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import Planner from './Planner.jsx';
import Judge from './Judge.jsx';
import './styles.css';
const view=new URLSearchParams(location.search).get('view');
const Screen=view==='check'?App:view==='judge'?Judge:Planner;
createRoot(document.getElementById('root')).render(<React.StrictMode><Screen/></React.StrictMode>);
