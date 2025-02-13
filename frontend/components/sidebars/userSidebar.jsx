// components/sidebars/right.jsx
import React from 'react';

const UserSidebar = () => {
  return (
    <aside className="right-sidebar">
      <div className="search-container">
        <input 
          type="text" 
          placeholder="Type to search" 
          className="search-input" 
        />
      </div>
      <div className="recent-chats">
        <h2>Recent Chats</h2>
        <ul className="chat-list">
          {/* Chat list items will be dynamically rendered here */}
        </ul>
      </div>
    </aside>
  );
};

export default UserSidebar;