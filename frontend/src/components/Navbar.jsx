/**
 * Navigation Bar Component
 * 
 * Persistent navigation header displaying brand name, navigation links,
 * the current user's role badge (admin vs staff), and logout action.
 */

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="nav-container">
        {/* Brand Logo & Name */}
        <NavLink to="/dashboard" className="nav-brand">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 7H4V5h16v2zm-2 4H6v2h12v-2zm-4 6h-4v2h4v-2z" />
          </svg>
          <span>InventoryHub</span>
        </NavLink>

        {/* Navigation Links */}
        <nav>
          <ul className="nav-links">
            <li>
              <NavLink
                to="/dashboard"
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/products"
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                Products
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/orders"
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                Orders
              </NavLink>
            </li>
            {user?.role === 'admin' && (
              <li>
                <NavLink
                  to="/users"
                  className={({ isActive }) => (isActive ? 'active' : '')}
                >
                  Users
                </NavLink>
              </li>
            )}
          </ul>
        </nav>

        {/* User Info & Logout Button */}
        {user && (
          <div className="nav-user">
            <div className="user-badge">
              <span>{user.name}</span>
              <span className={`role-tag ${user.role}`}>
                {user.role}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="btn btn-secondary btn-sm"
              title="Sign out of system"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
