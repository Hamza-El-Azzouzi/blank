// components/sidebars/right.jsx
import React from 'react';

const UserSidebar = () => {
  return (
    <>
      <div className="recent-chats">
        <h2>Recent Chats</h2>
        <ul className="chat-list">
          {/* Chat list items will be dynamically rendered here */}
        </ul>
      </div>
    </>
  );
};

export default UserSidebar;