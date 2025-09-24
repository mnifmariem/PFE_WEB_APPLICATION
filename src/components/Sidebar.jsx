import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Button } from 'react-bootstrap'

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  const toggleSidebar = () => {
    setCollapsed(!collapsed)
  }

  return (
    <>
      <div id="sidebar" className={collapsed ? 'collapsed' : ''}>
        <Button id="sidebar-toggle" onClick={toggleSidebar}>
          <i className="bi bi-list"></i>
        </Button>
        <h3 className="text-center mb-4">Menu</h3>
        <NavLink to="/" className="nav-link">Data Upload & Processing</NavLink>
        <NavLink to="/algorithms" className="nav-link">FFT vs Goertzel Analysis</NavLink>
        <NavLink to="/energy" className="nav-link">Energy Consumption</NavLink>
        <NavLink to="/latency" className="nav-link">Latency</NavLink>
        <NavLink to="/scenarios" className="nav-link">Scenario Comparison</NavLink>
        <NavLink to="/report" className="nav-link">Comprehensive Report</NavLink>
      </div>
      <div id="toggle-container" style={{ display: collapsed ? 'block' : 'none' }}>
        <Button id="sidebar-toggle-collapsed" onClick={toggleSidebar}>
          <i className="bi bi-arrow-left" style={{ color: '#333' }}></i>
        </Button>
      </div>
    </>
  )
}

export default Sidebar