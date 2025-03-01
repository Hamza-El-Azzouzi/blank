'use client'
import NavSidebar from '@/components/sidebars/navSidebar';
import UserSidebar from '@/components/sidebars/userSidebar';
import './main.css';
import React, { useState, useEffect, useRef } from 'react';
import { TiThMenu } from "react-icons/ti";
import { MdPeopleAlt } from "react-icons/md";
import { FiBell } from 'react-icons/fi';
import Link from 'next/link';
import Toast from '@/components/toast/Toast';
import * as cookies from '@/lib/cookie';

export default function MainLayout({ children }) {
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const leftSidebarRef = useRef(null);
  const rightSidebarRef = useRef(null);
  const leftToggleRef = useRef(null);
  const rightToggleRef = useRef(null);

  const sessionId = cookies.GetCookie("sessionId");

  useEffect(function handleSharedWorkerConnection() {
    const worker = new SharedWorker("./workers/shared-worker.js", "Social Network");

    worker.port.onmessage = (e) => {
      const data = JSON.parse(e.data);
      
      showToast(data.type, data.label);
    };

    worker.port.postMessage({
      session_id: sessionId,
      receiver_id: "839376aa-a302-43b0-87c3-6cd7fb7b6b23",
      content: "Salam Ana Hamza",
      receiver_type: "to_group"
    });

    return () => {
      worker.port.close();
    };
  }, []);

  const showToast = (type, message) => {
    const newToast = { id: Date.now(), type, message };
    setToasts((prevToasts) => [...prevToasts, newToast]);
  };
  const removeToast = (id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

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

    const handleNavLinkClick = () => {
      setLeftOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);

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