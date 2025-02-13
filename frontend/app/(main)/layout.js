"use client"
// app/(main)/layout.js
import NavSidebar from '@/components/sidebars/navSidebar';
import UserSidebar from '@/components/sidebars/userSidebar';
import './main.css';
import React, { useState } from 'react';

export default function MainLayout({ children }) {
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  return (
    <div className="app-container">
      <button className="toggle-btn left-toggle" onClick={() => setLeftOpen(!leftOpen)}>
        ☰
      </button>

      <button className="toggle-btn right-toggle" onClick={() => setRightOpen(!rightOpen)}>
        💬
      </button>

      <div className={`left-sidebar ${leftOpen ? 'active' : ''}`}>
        <NavSidebar />
      </div>

      <main className="main-content">
        {children}
      </main>

      <div className={`right-sidebar ${rightOpen ? 'active' : ''}`}>
        <UserSidebar />
      </div>
    </div>
  );
}