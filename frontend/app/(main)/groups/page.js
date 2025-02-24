/* eslint-disable react-hooks/exhaustive-deps */
// app/(main)/groups/page.js
"use client"
import React, { useState, useEffect } from 'react';
import { FiSearch, FiPlus } from 'react-icons/fi';
import CreateGroup from '@/components/groups/create/createGroup';
import GroupCard from '@/components/groups/cards/groupCard';
import './groups.css';
import { GetCookie } from '@/lib/cookie';
import Toast from '@/components/toast/Toast';

const GroupsPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [toasts, setToasts] = useState([]);
    const [groups, setGroups] = useState([]);
    // const [cookieValue, setCookieValue] = useState(null);
    const cookieValue = GetCookie("sessionId")
    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/groups`, {
            method: "GET",
            credentials: "include",
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${cookieValue}`
            },
        })
            .then(response => {

                if (!response.ok) {
                    return response.json().then(error => { throw error; });
                }
                return response.json();
            })
            .then((data) => {
                setGroups([...data.data, ...groups]);
            }).catch((error) => {
                console.error(error)
            })
    }, []);

    const showToast = (type, message) => {
        const newToast = { id: Date.now(), type, message };
        setToasts((prevToasts) => [...prevToasts, newToast]);
    };
    const removeToast = (id) => {
        setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    };
  
    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        // Fetch filtered results from API
        fetch(`${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/groups/search?q=${term}`, {
            method: "GET",
            credentials: "include",
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${cookieValue}`
            },
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(error => { throw error; });
            }
            return response.json();
        })
        .then((data) => {
            setGroups(data.data);
        })
        .catch((error) => {
            console.error(error);
            showToast('error', 'Failed to search groups');
        });
    };
    const handleCreateGroup = (groupData) => {
        // api/createGroup
        fetch(`${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/createGroup`, {
            method: "POST",
            credentials: "include",
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${cookieValue}`
            },
            body: JSON.stringify(groupData)

        })
            .then(response => {
                if (!response.ok) {

                    return response.json().then(error => { throw error; });
                }
                return response.json();
            })
            .then((data) => {
                showToast('success', 'Success! Operation completed.');
                setShowCreateGroup(false)
                setGroups([data.data, ...groups]);
            }).catch((error) => {
                console.error(error)
                showToast('error', error.message);
            })
    };

    const handleJoinGroup = (groupId) => {
        fetch(`${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/join/${groupId}/requested`, {
            method: "POST",
            credentials: "include",
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${cookieValue}`
            },
        })
            .then(response => {
                if (!response.ok) {

                    return response.json().then(error => { throw error; });
                }
                return response.json();
            })
            .then((data) => {
                showToast('success', 'Success! Operation completed.');
            }).catch((error) => {
                console.error(error)
                showToast('error', error.message);
            })
    };


    return (
        <div className="groups-page">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
            <div className="groups-header">
                <h1>Discover Groups</h1>
                <button className="create-group-btn" onClick={() => setShowCreateGroup(true)}>
                    <FiPlus /> Create New Group
                </button>
            </div>

            <div className="groups-search">
                <FiSearch className="search-icon" />
                <input type="text" placeholder="Search groups..." value={searchTerm} onChange={handleSearch} className="search-input" />
            </div>

            <div className="groups-grid">
                {groups && groups.map(group => (
                    <GroupCard key={group.GroupeId} group={group} onJoinClick={handleJoinGroup} />
                ))}
            </div>

            {showCreateGroup && (
                <CreateGroup onClose={() => setShowCreateGroup(false)} onSubmit={handleCreateGroup} />
            )}
        </div>
    );
};

export default GroupsPage;