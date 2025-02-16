// app/(main)/groups/page.js
"use client"
import React, { useState } from 'react';
import { FiSearch, FiPlus } from 'react-icons/fi';
import CreateGroup from '@/components/groups/create/createGroup';
import GroupCard from '@/components/groups/cards/groupCard';
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
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [groups, setGroups] = useState(mockGroups);

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
    };

    const handleCreateGroup = (groupData) => {
        const newGroup = {
            id: groups.length + 1,
            ...groupData,
            memberCount: 1,
            isJoined: true
        };
        setGroups([newGroup, ...groups]);
    };

    const handleJoinGroup = (groupId) => {
        setGroups(groups.map(group => {
            if (group.id === groupId) {
                return { ...group, isJoined: !group.isJoined };
            }
            return group;
        }));
    };

    const filteredGroups = groups.filter(group =>
        group.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="groups-page">
            <div className="groups-header">
                <h1>Discover Groups</h1>
                <button className="create-group-btn" onClick={() => setShowCreateGroup(true)}>
                    <FiPlus /> Create New Group
                </button>
            </div>

            <div className="groups-search">
                <FiSearch className="search-icon" />
                <input type="text" placeholder="Search groups..." value={searchTerm} onChange={handleSearch} className="search-input"/>
            </div>

            <div className="groups-grid">
                {filteredGroups.map(group => (
                    <GroupCard key={group.id} group={group} onJoinClick={handleJoinGroup}/>
                ))}
            </div>

            {showCreateGroup && (
                <CreateGroup onClose={() => setShowCreateGroup(false)} onSubmit={handleCreateGroup}/>
            )}
        </div>
    );
};

export default GroupsPage;