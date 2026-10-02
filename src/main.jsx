import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import Planner from './Planner.jsx';
import './styles.css';
const Screen=new URLSearchParams(location.search).get('view')==='check'?App:Planner;
createRoot(document.getElementById('root')).render(<React.StrictMode><Screen/></React.StrictMode>);
