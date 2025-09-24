// src/components/common/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ collapsed, onToggle }) => {
  const location = useLocation();
  
  const menuItems = [
    { path: '/', label: 'Data Upload & Processing', icon: 'bi-upload' },
    { path: '/algorithms', label: 'FFT vs Goertzel Analysis', icon: 'bi-graph-up' },
    { path: '/energy', label: 'Energy Consumption', icon: 'bi-lightning-fill' },
    { path: '/latency', label: 'Latency', icon: 'bi-clock' },
    { path: '/scenarios', label: 'Scenario Comparison', icon: 'bi-bar-chart' },
    { path: '/report', label: 'Comprehensive Report', icon: 'bi-file-text' }
  ];

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <button 
        className="sidebar-toggle "
        onClick={onToggle}
        style={{ display: collapsed ? 'none' : 'block' }}
      >
        <i className="bi bi-list"></i>
      </button>
      
      <h3 className="text-center mb-4">Menu</h3>
      
      {menuItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
        >
          <i className={item.icon}></i> {item.label}
        </Link>
      ))}
    </div>
  );
};

export default Sidebar;