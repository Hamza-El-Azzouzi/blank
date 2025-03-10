"use client"
import React, { useState, useEffect, useRef } from 'react';
import { FiSearch, FiPlus } from 'react-icons/fi';
import CreateGroup from '@/components/groups/create/createGroup';
import GroupCard from '@/components/groups/cards/groupCard';
import './groups.css';
import { GetCookie } from '@/lib/cookie';
import Toast from '@/components/toast/Toast';

const ITEMS_PER_PAGE = 20;

const GroupsPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [toasts, setToasts] = useState([]);
    const [groups, setGroups] = useState(new Set()); 
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const cookieValue = GetCookie("sessionId");

    const observerRef = useRef(null);
    const loadMoreRef = useRef(null);

    useEffect(() => {
        if (searchTerm || loading || !hasMore) return;

        const fetchGroups = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/groups/${page}`, {
                    credentials: "include",
                    headers: {
                        'content-type': "application/json",
                        'Authorization': `Bearer ${cookieValue}`
                    }
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch groups");
                }

                const data = await response.json();

                setGroups(prevGroups => {
                    const newGroups = new Set(prevGroups);
                   if (data.data) data.data.forEach(group => newGroups.add(JSON.stringify(group))); 
                    return newGroups;
                });

                if ((data.data && data.data[0].TotalCount < ITEMS_PER_PAGE) || (data.data === null)) {
                    setHasMore(false);
                }
            } catch (err) {
                showToast('error', 'Failed to fetch Groups');
            } finally {
                setLoading(false);
            }
        };

        fetchGroups();
    }, [page, searchTerm, cookieValue]);

    useEffect(() => {
        if (!loadMoreRef.current || !hasMore) return;

        observerRef.current = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loading) {
                    setPage(prevPage => prevPage + ITEMS_PER_PAGE);
                }
            },
            { threshold: 1.0 }
        );

        observerRef.current.observe(loadMoreRef.current);

        return () => {
            if (observerRef.current) observerRef.current.disconnect();
        };
    }, [loading, hasMore]);

    const handleSearch = async (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        setPage(0);
        setHasMore(true);
        setGroups(new Set()); 

        if (term.length > 50) {
            showToast('error', 'Search Term Cannot Exceed 50 Characters');
            return;
        }
        if (!/^[a-zA-Z0-9\s]*$/.test(term)) {
            showToast('error', 'Search Can Only Contain Letters, Numbers, and Spaces');
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/groups/search?q=${term}`, {
                method: "GET",
                credentials: "include",
                headers: {
                    'content-type': 'application/json',
                    'Authorization': `Bearer ${cookieValue}`
                },
            });

            if (!response.ok) {
                throw new Error("Failed to search groups");
            }

            const data = await response.json();
            setGroups(new Set(data.data.map(group => JSON.stringify(group)))); 
        } catch (error) {
            showToast('error', 'Group Not Found');
        }
    };
    const handleJoinGroup = (groupID) => {
            fetch(`${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/join/${groupID}/requested`, {
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
                .then(() => {
                    showToast('success', 'Success! Your request was sent successfully');
                }).catch(() => {
                    
                    showToast('error', "An Error Occure, Try Later!!");
                })
        };
    const handleCreateGroup = (groupData) => {
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
                showToast('success', 'Success! Group Created Successfully.');
                setShowCreateGroup(false);

                setGroups(prevGroups => {
                    const newGroups = new Set(prevGroups);
                    newGroups.add(JSON.stringify(data.data)); 
                    return newGroups;
                });
            })
            .catch((error) => {
                showToast('error', "An Error Occure, Try Later!!");
            });
    };

    const showToast = (type, message) => {
        const newToast = { id: Date.now(), type, message };
        setToasts((prevToasts) => [...prevToasts, newToast]);
    };

    const removeToast = (id) => {
        setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
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
                <input type="text" placeholder="Search groups..." value={searchTerm} onChange={handleSearch} maxLength={50} className="search-input" />
            </div>

            <div className="groups-grid">
                {[...groups].map(groupJson => {
                    const group = JSON.parse(groupJson);
                    return <GroupCard key={group.GroupeId} group={group} onJoinClick={handleJoinGroup} />;
                })}
            </div>
           
            <div ref={loadMoreRef} style={{ height: '1px' }}></div>
            {showCreateGroup && (
                <CreateGroup onClose={() => setShowCreateGroup(false)} onSubmit={handleCreateGroup} />
            )}
        </div>
    );
};

export default GroupsPage;
