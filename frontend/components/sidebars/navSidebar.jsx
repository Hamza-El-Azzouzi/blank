// components/sidebars/navSidebar.jsx
import React from 'react';
import Link from 'next/link';
import { FiHome, FiBell, FiUsers, FiUser, FiMessageSquare, FiLogOut } from 'react-icons/fi';
import { BiSearch } from 'react-icons/bi';
import './sidebar.css';


const NavSidebar = () => {
  return (
    <>
      <div className="search-container">
        <div className="search-input-wrapper">
          <BiSearch className="search-icon" />
          <input type="text" placeholder="Search..." className="search-input" />
        </div>
      </div>

      <nav className="nav-menu">
        <ul>
          <li className="nav-item">
            <Link href="/" className="nav-link">
              <FiHome className="nav-icon" />
              <span>Home</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link href="/groups" className="nav-link">
              <FiUsers className="nav-icon" />
              <span>Groups</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link href="/notifications" className="nav-link">
              <FiBell className="nav-icon" />
              <span>Notifications</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link href="/messages" className="nav-link">
              <FiMessageSquare className="nav-icon" />
              <span>Messages</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link href="/profile" className="nav-link">
              <FiUser className="nav-icon" />
              <span>Profile</span>
            </Link>
          </li>
        </ul>
      </nav>

      <div className="nav-footer">
        <Link href="/logout" className="nav-link logout">
          <FiLogOut className="nav-icon" />
          <span>Log out</span>
        </Link>
      </div>
    </>
  );
};

export default NavSidebar;