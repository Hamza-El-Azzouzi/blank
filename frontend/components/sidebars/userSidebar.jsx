// components/sidebars/userSidebar.jsx
import React from 'react';
import './sidebar.css';

const mockContacts = [
  { id: 1, name: 'Emma Watson', status: 'online' },
  { id: 2, name: 'James Smith', status: 'online' },
  { id: 3, name: 'Sophia Chen', status: 'online' },
  { id: 4, name: 'Marcus Johnson', status: 'online' },
  { id: 5, name: 'Isabella Garcia', status: '' }
];

const UserSidebar = () => {
  return (
    <>
      <h2 className="contacts-header">Contacts</h2>
      <ul className="contacts-list">
        {mockContacts.map(contact => (
          <li key="{contact.id}" className="contact-item">
            <div className="contact-avatar-wrapper">
              <img src="/default-avatar.jpg" alt={contact.name} className="contact-avatar" />
              <span className={`status-indicator ${contact.status}`}></span>
            </div>
            <span className="contact-name">{contact.name}</span>
          </li>
        ))}
      </ul>
    </>
  );
};

export default UserSidebar;