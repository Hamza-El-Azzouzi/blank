// app/(main)/groups/page.js
"use client"
import React, { useState } from 'react';
import { FiSearch, FiUsers, FiPlus } from 'react-icons/fi';
import Link from 'next/link';
import './groups.css';

const mockGroups = [
    {
        id: 1,
        name: "Tech Enthusiasts",
        description: "A community for technology lovers and innovators",
        memberCount: 1234,
        isJoined: false
    },
    {
        id: 2,
        name: "Photography Club",
        description: "Share your best shots and photography tips",
        memberCount: 856,
        isJoined: true
    },
    {
        id: 3,
        name: "Book Club",
        description: "Discuss your favorite books and discover new reads",
        memberCount: 567,
        isJoined: false
    }
];

const GroupsPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredGroups, setFilteredGroups] = useState(mockGroups);

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);

        const filtered = mockGroups.filter(group =>
            group.name.toLowerCase().includes(term)
        );
        setFilteredGroups(filtered);
    };

    return (
        <div className="groups-page">
            <div className="groups-header">
                <h1>Discover Groups</h1>
                <button className="create-group-btn">
                    <FiPlus /> Create New Group
                </button>
            </div>

            <div className="groups-search">
                <FiSearch className="search-icon" />
                <input type="text" placeholder="Search groups..." value={searchTerm} onChange={handleSearch} className="search-input" />
            </div>

            <div className="groups-grid">
                {filteredGroups.map(group => (
                    <Link href={`/groups/${group.id}`} key={group.id} className="group-card">
                        <div className="group-info">
                            <h3>{group.name}</h3>
                            <p>{group.description}</p>
                            <div className="group-stats">
                                <span className="member-count">
                                    <FiUsers /> {group.memberCount} members
                                </span>
                                <button className={`join-button ${group.isJoined ? 'joined' : ''}`}>
                                    {group.isJoined ? 'Joined' : 'Join'}
                                </button>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default GroupsPage;