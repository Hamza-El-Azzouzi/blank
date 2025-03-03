import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { fetchBlob } from '@/lib/fetch_blob';
import { FiSearch } from 'react-icons/fi';
import './inviteDialog.css';

const InviteDialog = ({ onClose, cookieValue, groupID }) => {
    const [users, setUsers] = useState([]);
    const [lastUserId, setLastUserId] = useState('');
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const observerRef = useRef();
    const [searchQuery, setSearchQuery] = useState('');
    const debounceTimeoutRef = useRef(null);
    const [displayedUsers, setDisplayedUsers] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [isSearchLoading, setIsSearchLoading] = useState(false);
    const [lastSearchId, setLastSearchId] = useState('');
    const [hasMoreSearch, setHasMoreSearch] = useState(true);

    const fetchUsers = async () => {
        if (loading || !hasMore) return;
        setLoading(true);
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/group/${groupID}/invitable?offset=${lastUserId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${cookieValue}`
                    }
                }
            );

            const data = await response.json();
            if (data.data && data.data.length > 0) {
                const newUsers = await Promise.all(
                    data.data.map(async (user) => ({
                        ...user,
                        avatar: user.avatar
                            ? await fetchBlob(process.env.NEXT_PUBLIC_BACK_END_DOMAIN + user.avatar)
                            : '/default-avatar.jpg',
                        invited: false
                    }))
                );

                setUsers(prev => [...prev, ...newUsers]);
                setDisplayedUsers(prev => [...prev, ...newUsers]);
                setLastUserId(data.data[data.data.length - 1].user_id);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const performSearch = async (query, isNewSearch = false) => {
        if (query.length < 1) {
            setDisplayedUsers(users);
            setSearchResults([]);
            setIsSearchLoading(false);
            return;
        }

        if (isNewSearch) {
            setLastSearchId('');
            setSearchResults([]);
            setHasMoreSearch(true);
            setDisplayedUsers([]);
        }

        if (!hasMoreSearch && !isNewSearch) return;

        setIsSearchLoading(true);
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/group/${groupID}/searchinvitable?offset=${isNewSearch ? '' : lastSearchId}&q=${query}`,
                {
                    headers: {
                        'Authorization': `Bearer ${cookieValue}`
                    }
                }
            );

            const data = await response.json();
            if (data.data && data.data.length > 0) {
                const newSearchResults = await Promise.all(
                    data.data.map(async (user) => ({
                        ...user,
                        avatar: user.avatar
                            ? await fetchBlob(process.env.NEXT_PUBLIC_BACK_END_DOMAIN + user.avatar)
                            : '/default-avatar.jpg',
                        invited: false
                    }))
                );

                if (data.data[data.data.length - 1].user_id) {
                    setLastSearchId(data.data[data.data.length - 1].user_id);
                    setHasMoreSearch(newSearchResults.length === 20);
                } else {
                    setHasMoreSearch(false);
                }

                setSearchResults(prev => isNewSearch ? newSearchResults : [...prev, ...newSearchResults]);
                setDisplayedUsers(prev => isNewSearch ? newSearchResults : [...prev, ...newSearchResults]);
            } else {
                setHasMoreSearch(false);
                if (isNewSearch) {
                    setSearchResults([]);
                    setDisplayedUsers([]);
                }
            }
        } catch (error) {
            console.error('Error searching users:', error);
        } finally {
            setIsSearchLoading(false);
        }
    };

    const debouncedSearch = useCallback((query) => {
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        debounceTimeoutRef.current = setTimeout(() => {
            performSearch(query, true);
        }, 300);
    }, []);

    const handleSearch = (e) => {
        setDisplayedUsers([]);
        const query = e.target.value;
        setSearchQuery(query);
        setLastSearchId('');
        
        if (query.length < 1) {
            setDisplayedUsers(users);
            setSearchResults([]);
            setIsSearchLoading(false);
            return;
        }
        
        setIsSearchLoading(true);
        debouncedSearch(query);
    };

    const handleInvite = async (userId) => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/join/${groupID}/invite`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${cookieValue}`
                    },
                    body: JSON.stringify({ user_id: userId })
                }
            );

            if (response.ok) {
                setDisplayedUsers(prev =>
                    prev.map(user =>
                        user.user_id === userId ? { ...user, invited: true } : user
                    )
                );
            }
        } catch (error) {
            console.error('Error inviting user:', error);
        }
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && !loading) {
                    if (searchQuery) {
                        if (hasMoreSearch && !isSearchLoading) {
                            performSearch(searchQuery);
                        }
                    } else if (hasMore) {
                        fetchUsers();
                    }
                }
            },
            { threshold: 0.5 }
        );

        const currentObserver = observerRef.current;
        if (currentObserver) {
            observer.observe(currentObserver);
        }

        return () => {
            if (currentObserver) {
                observer.disconnect();
            }
        };
    }, [lastUserId, hasMore, loading, searchQuery, lastSearchId, hasMoreSearch, isSearchLoading]);

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className="invite-dialog-overlay" onClick={onClose}>
            <div className="invite-dialog" onClick={e => e.stopPropagation()}>
                <h3>Invite Members</h3>

                <div className="invite-search">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={handleSearch}
                        className="invite-search-input"
                    />
                </div>

                <div className="invite-list">
                    {isSearchLoading && !displayedUsers.length ? (
                        <div className="invite-loading">Loading...</div>
                    ) : searchQuery && displayedUsers.length === 0 ? (
                        <div className="invite-empty-message">No results found</div>
                    ) : (
                        <>
                            {displayedUsers.map(user => (
                                <div key={user.user_id} className="invite-item">
                                    <div className="invite-user-info">
                                        <Link href={`/profile/${user.user_id}`}>
                                            <img src={user.avatar} alt={`${user.first_name}'s avatar`} className="invite-avatar" />
                                            <span className="invite-name">{user.first_name} {user.last_name}</span>
                                        </Link>
                                    </div>
                                    <button
                                        className={`invite-button ${user.invited ? 'invited' : ''}`}
                                        onClick={() => handleInvite(user.user_id)}
                                        disabled={user.invited}
                                    >
                                        {user.invited ? 'Invited' : 'Invite'}
                                    </button>
                                </div>
                            ))}
                            <div ref={observerRef} style={{ height: '20px' }}></div>
                            {(loading || (isSearchLoading && displayedUsers.length > 0)) && (
                                <div className="invite-loading">Loading more...</div>
                            )}
                        </>
                    )}
                </div>

                {!hasMore && displayedUsers.length === 0 && !searchQuery && (
                    <div className="invite-empty-message">
                        No users available to invite
                    </div>
                )}

                <button className="invite-close-btn" onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default InviteDialog;
