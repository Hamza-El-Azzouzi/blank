'use client'
import NavSidebar from '@/components/sidebars/navSidebar';
import UserSidebar from '@/components/sidebars/userSidebar';
import './main.css';
import React, { useState, useEffect, useRef } from 'react';
import { TiThMenu } from "react-icons/ti";
import { MdPeopleAlt } from "react-icons/md";

export default function MainLayout({ children }) {
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const leftSidebarRef = useRef(null);
  const rightSidebarRef = useRef(null);
  const leftToggleRef = useRef(null);
  const rightToggleRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (leftOpen && !leftSidebarRef.current?.contains(event.target) &&
        !leftToggleRef.current?.contains(event.target)) {
        setLeftOpen(false);
      }

      if (rightOpen && !rightSidebarRef.current?.contains(event.target) &&
        !rightToggleRef.current?.contains(event.target)) {
        setRightOpen(false);
      }
    };

    const handleLinkClick = () => {
      setLeftOpen(false);
      setRightOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);

    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', handleLinkClick);
    });

    const contactLinks = document.querySelectorAll('.sidebar-contact-item');
    contactLinks?.forEach(link => {
      link.addEventListener('click', handleLinkClick);
    });

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      navLinks.forEach(link => {
        link.removeEventListener('click', handleLinkClick);
      });
      contactLinks?.forEach(link => {
        link.addEventListener('click', handleLinkClick);
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

        <button className="mobile-nav-item" onClick={handleRightToggle} ref={rightToggleRef}>
          <MdPeopleAlt className="mobile-nav-icon" />
        </button>
      </nav>
    </div>
  );
}