// src/components/common/Layout.jsx
import React, { useState } from 'react';
import Sidebar from './sideBar';
import Header from './Header';

const Layout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="app-layout">
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <div className={`content ${sidebarCollapsed ? 'shifted' : ''}`}>
        <div className={`toggle-container ${sidebarCollapsed ? '' : 'd-none'}`}>
          <button 
            className="sidebar-toggle-collapsed"
            onClick={toggleSidebar}
          >
            <i className="bi bi-arrow-left"></i>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Layout;