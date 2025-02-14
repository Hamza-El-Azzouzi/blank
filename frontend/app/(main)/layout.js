"use client"
// app/(main)/layout.js
import NavSidebar from '@/components/sidebars/navSidebar';
import UserSidebar from '@/components/sidebars/userSidebar';
import './main.css';
import React, { useState } from 'react';
import { TiThMenu } from "react-icons/ti";
import { MdPeopleAlt } from "react-icons/md";

export default function MainLayout({ children }) {
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  return (
    <div className="app-container">
      <button className="toggle-btn left-toggle" onClick={() => setLeftOpen(!leftOpen)}>
        <TiThMenu />
      </button>

      <button className="toggle-btn right-toggle" onClick={() => setRightOpen(!rightOpen)}>
        <MdPeopleAlt/>
      </button>

      <div className={`nav-sidebar ${leftOpen ? 'active' : ''}`}>
        <NavSidebar />
      </div>

      <main className="main-content">
        {children}
      </main>

      <div className={`contact-sidebar ${rightOpen ? 'active' : ''}`}>
        <UserSidebar />
      </div>
    </div>
  );
}