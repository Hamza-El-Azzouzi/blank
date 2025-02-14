"use client"
// app/(main)/layout.js
import NavSidebar from '@/components/sidebars/navSidebar';
import UserSidebar from '@/components/sidebars/userSidebar';
import './main.css';
import React, { useState } from 'react';
import { TiThMenu } from "react-icons/ti";
import { MdPeopleAlt } from "react-icons/md";
import { FiBell } from 'react-icons/fi';
import Link from 'next/link';

export default function MainLayout({ children }) {
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  return (
    <div className="app-container">
      <div className={`nav-sidebar ${leftOpen ? 'active' : ''}`}>
        <NavSidebar />
      </div>

      <main className="main-content">
        {children}
      </main>

      <div className={`contact-sidebar ${rightOpen ? 'active' : ''}`}>
        <UserSidebar />
      </div>

      <nav className="mobile-nav">
        <button className="mobile-nav-item" onClick={() => setLeftOpen(!leftOpen)}>
          <TiThMenu className="mobile-nav-icon" />
        </button>
        <Link href="/notifications" className="mobile-nav-item">
          <FiBell className="mobile-nav-icon" />
        </Link>
        <button className="mobile-nav-item" onClick={() => setRightOpen(!rightOpen)}>
          <MdPeopleAlt className="mobile-nav-icon" />
        </button>
      </nav>
    </div>
  );
}