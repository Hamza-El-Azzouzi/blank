// components/groups/groupCard.jsx
"use client"
import React from 'react';
import Link from 'next/link';
import { FiUsers } from 'react-icons/fi';
import './groupCard.css';

const GroupCard = ({ group, onJoinClick }) => {
  const handleJoinClick = (e) => {
    e.preventDefault();
    onJoinClick(group.id);
  };

  return (
    <Link href={`/groups/${group.id}`} className="group-card">
      <div className="group-info">
        <h3>{group.name}</h3>
        <p>{group.description}</p>
        <div className="group-stats">
          <span className="member-count">
            <FiUsers /> {group.memberCount} members
          </span>
          <button 
            onClick={handleJoinClick}
            className={`join-button ${group.isJoined ? 'joined' : ''}`}
          >
            {group.isJoined ? 'Joined' : 'Join'}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default GroupCard;