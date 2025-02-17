// components/groups/groupHeader.jsx
"use client"
import React from 'react';
import { FiUsers } from 'react-icons/fi';
import './groupHeader.css';

const GroupHeader = ({ group, onMembershipUpdate }) => {
    const handleMembershipClick = () => {
        onMembershipUpdate(!group.isJoined);
    };

    return (
        <div className="group-header">
            <div className="group-info">
                <h1>{group.name}</h1>
                <p className="group-description">{group.description}</p>
                <div className="group-meta">
                    <span className="group-stat">
                        <FiUsers /> {group.memberCount} members
                    </span>
                    <span className="group-stat">
                        Created: {group.created}
                    </span>
                    <span className="group-stat">
                        Creator: {group.admin}
                    </span>
                </div>
            </div>
            {group.isJoined ? (
                <button
                    className="leave-group-btn"
                    onClick={handleMembershipClick}
                >
                    Leave Group
                </button>
            ) : (
                <button
                    className="join-group-btn"
                    onClick={handleMembershipClick}
                >
                    Join Group
                </button>
            )}
        </div>
    );
};

export default GroupHeader;