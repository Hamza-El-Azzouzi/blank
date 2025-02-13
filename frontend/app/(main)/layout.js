// app/(main)/layout.js
import React from 'react';
import NavSidebar from '@/components/sidebars/navSidebar';
import UserSidebar from '@/components/sidebars/userSidebar';
import './main.css';

export default function MainLayout({ children }) {
  return (
    <div className="app-container">
      <NavSidebar />
      <main className="main-content">
        {children}
      </main>
      <UserSidebar />
    </div>
  );
}