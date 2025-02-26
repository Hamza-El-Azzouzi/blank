// app/(main)/layout.js
"use client"
import NavSidebar from '@/components/sidebars/navSidebar';
import UserSidebar from '@/components/sidebars/userSidebar';
import './main.css';
import React, { useState, useEffect, useRef } from 'react';
import { TiThMenu } from "react-icons/ti";
import { MdPeopleAlt } from "react-icons/md";
import { FiBell } from 'react-icons/fi';
import Link from 'next/link';
import GetCookie from '@/lib/cookie';

export default function MainLayout({ children }) {

  useEffect(function handleSharedWorkerConnection() {
    const worker = new SharedWorker("./workers/shared-worker.js", "Social Network");

    // worker.port.onmessage = (event) => {
    //   console.log(event.data);

    // };

    worker.port.postMessage({
      type: "message",
      content: "Salam Ana Hamza"
    });

    return () => {
      worker.port.close();
    };
  }, []);


  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const leftSidebarRef = useRef(null);
  const rightSidebarRef = useRef(null);
  const leftToggleRef = useRef(null);
  const rightToggleRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Handle left sidebar
      if (leftOpen && !leftSidebarRef.current?.contains(event.target) &&
        !leftToggleRef.current?.contains(event.target)) {
        setLeftOpen(false);
      }

      // Handle right sidebar
      if (rightOpen && !rightSidebarRef.current?.contains(event.target) &&
        !rightToggleRef.current?.contains(event.target)) {
        setRightOpen(false);
      }
    };

    const handleNavLinkClick = () => {
      setLeftOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);

    // Add click handlers to all nav links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', handleNavLinkClick);
    });

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      navLinks.forEach(link => {
        link.removeEventListener('click', handleNavLinkClick);
      });
    };
  }, [leftOpen, rightOpen]);

  const handleLeftToggle = () => {
    setLeftOpen(!leftOpen);
    if (rightOpen) setRightOpen(false);
  };

  const handleRightToggle = () => {
    setRightOpen(!rightOpen);
    if (leftOpen) setLeftOpen(false);
  };

  return (
    <div className="app-container">
      <div className={`nav-sidebar ${leftOpen ? 'active' : ''}`} ref={leftSidebarRef}>
        <NavSidebar />
      </div>

      <main className="main-content">
        {children}
      </main>

      <div className={`contact-sidebar ${rightOpen ? 'active' : ''}`} ref={rightSidebarRef}>
        <UserSidebar />
      </div>

      <nav className="mobile-nav">
        <button className="mobile-nav-item" onClick={handleLeftToggle} ref={leftToggleRef}>
          <TiThMenu className="mobile-nav-icon" />
        </button>

        <Link href="/notifications" className="mobile-nav-item">
          <FiBell className="mobile-nav-icon" />
        </Link>

        <button className="mobile-nav-item" onClick={handleRightToggle} ref={rightToggleRef}>
          <MdPeopleAlt className="mobile-nav-icon" />
        </button>
      </nav>
    </div>
  );
}