'use client'
import NavSidebar from '@/components/sidebars/navSidebar';
import UserSidebar from '@/components/sidebars/userSidebar';
import './main.css';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TiThMenu } from "react-icons/ti";
import { MdPeopleAlt } from "react-icons/md";
import { useWebSocket } from '@/lib/useWebSocket';
import Toast from '@/components/toast/Toast';

export default function MainLayout({ children }) {
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const leftSidebarRef = useRef(null);
  const rightSidebarRef = useRef(null);
  const leftToggleRef = useRef(null);
  const rightToggleRef = useRef(null);

  const showToast = useCallback((message, type) => {
    const newToast = {
      id: Date.now(),
      message,
      type
    };
    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newToast.id));
    }, 3000);
  }, []);

  useWebSocket(null, null, showToast);

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
        link.removeEventListener('click', handleLinkClick);
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

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <div className="app-container">
      <div className={`nav-sidebar ${leftOpen ? 'active' : ''}`} ref={leftSidebarRef}>
        <NavSidebar />
      </div>

      <main className="main-content" id='main-content'>
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

      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}