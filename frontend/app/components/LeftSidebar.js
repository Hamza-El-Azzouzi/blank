'use client';

import { User, Users, Bell, MessageSquare, LogOut } from 'lucide-react';

export default function LeftSidebar() {
  return (
    <div className="left-sidebar">
      <div className="sidebar-content">
        <input type="text" placeholder="Search..." className="search-bar" />
        <div className="sidebar-item">
          <User size={24} />
          <span>Profile</span>
        </div>
        <div className="sidebar-item">
          <Users size={24} />
          <span>Groups</span>
        </div>
        <div className="sidebar-item">
          <Bell size={24} />
          <span>Notifications</span>
        </div>
        <div className="sidebar-item">
          <MessageSquare size={24} />
          <span>Messages</span>
        </div>
      </div>
      
      <div className="sidebar-item logout-button">
        <LogOut size={24} />
        <span>Logout</span>
      </div>
    </div>
  );
}