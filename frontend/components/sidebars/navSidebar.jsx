// components/sidebars/left.jsx
import React from 'react';
import Link from 'next/link';

const NavSidebar = () => {
  return (
    <>
      <div className="logo-container">
        <img src="/logo.png" alt="Space Logo" className="logo" />
        <input type="text" placeholder="search" className="search-input" />
      </div>
      <nav className="nav-menu">
        <ul>
          <li className="nav-item">
            <Link href="/" className="nav-link">
              <span className="nav-icon">🏠</span>
              <span>Home</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link href="/notifications" className="nav-link">
              <span className="nav-icon">📑</span>
              <span>Notifications</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link href="/groups" className="nav-link">
              <span className="nav-icon">📑</span>
              <span>Groups</span>
            </Link>
          </li>
          <li className="nav-item profile">
            <Link href="/profile" className="nav-link">
              <span className="nav-icon">👤</span>
              <span>Profile</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link href="/logout" className="nav-link">
              <span className="nav-icon">🚪</span>
              <span>Log out</span>
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
};

export default NavSidebar;