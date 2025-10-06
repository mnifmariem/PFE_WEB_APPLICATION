// src/components/common/Header.jsx
import React from 'react';

const Header = ({ title, subtitle, titleIcon, subtitleIcon }) => {
  return (
    <div className="header-section">
      <h1 className="text-center mb-4">
        <i className={`bi ${titleIcon}`} style={{ color: '#000000' }}></i> 
        {title}
      </h1>
      {subtitle && (
        <h2 className="text-center mb-4">
          <i className={`bi ${subtitleIcon}`} style={{ color: '#ffc107' }}></i> 
          {subtitle}
        </h2>
      )}
    </div>
  );
};

export default Header;