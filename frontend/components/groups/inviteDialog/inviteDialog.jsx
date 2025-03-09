import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { fetchBlob } from '@/lib/fetch_blob';
import { FiSearch, FiX } from 'react-icons/fi';
import './inviteDialog.css';
import Toast from '@/components/toast/Toast';

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
    const [initialized, setInitialized] = useState(false);
    const [toasts, setToasts] = useState([]);

    const showToast = (type, message) => {
        const newToast = { id: Date.now(), type, message };
        setToasts((prevToasts) => [...prevToasts, newToast]);
    };

    const removeToast = (id) => {
        setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    };

    const fetchUsers = async () => {
        if (loading || !hasMore) return;
        setLoading(true);
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/join/${groupID}/invitable?offset=${lastUserId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${cookieValue}`
                    }
                }
            );

            const data = await response.json();
            const followers = data.data.follow_list;
            if (followers && followers.length > 0) {
                const newUsers = await Promise.all(
                    followers.map(async (user) => ({
                        ...user,
                        avatar: user.avatar
                            ? await fetchBlob(process.env.NEXT_PUBLIC_BACK_END_DOMAIN + user.avatar)
                            : '/default-avatar.jpg',
                        invited: false
                    }))
                );

                setUsers(prev => [...prev, ...newUsers]);
                setDisplayedUsers(prev => [...prev, ...newUsers]);
                setLastUserId(followers[followers.length - 1].user_id);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            showToast('error', "An Error Occurred, Try Later!!");
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
                `${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/join/${groupID}/searchinvitable?offset=${isNewSearch ? '' : lastSearchId}&q=${query}`,
                {
                    headers: {
                        'Authorization': `Bearer ${cookieValue}`
                    }
                }
            );

            const data = await response.json();
            const searchedfollowers = data.data.follow_list;
            if (searchedfollowers && searchedfollowers.length > 0) {
                const newSearchResults = await Promise.all(
                    searchedfollowers.map(async (user) => ({
                        ...user,
                        avatar: user.avatar
                            ? await fetchBlob(process.env.NEXT_PUBLIC_BACK_END_DOMAIN + user.avatar)
                            : '/default-avatar.jpg',
                        invited: false
                    }))
                );

                if (searchedfollowers[searchedfollowers.length - 1].user_id) {
                    setLastSearchId(searchedfollowers[searchedfollowers.length - 1].user_id);
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
            showToast('error', "An Error Occurred, Try Later!!");
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
                showToast('success', 'Invitation sent successfully');
            }
        } catch (error) {
            showToast('error', "An Error Occurred, Try Later!!");
        }
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && !loading) {
                    if (!initialized) {
                        setInitialized(true);
                        fetchUsers();
                    } else if (searchQuery) {
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
    }, [lastUserId, hasMore, loading, searchQuery, lastSearchId, hasMoreSearch, isSearchLoading, initialized]);

    useEffect(() => {
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, []);

    return (
        <div className="invite-dialog-overlay" onClick={onClose}>
            <div className="invite-dialog" onClick={e => e.stopPropagation()}>
                <div className="invite-dialog-header">
                    <h3 className="invite-dialog-title">Invite Members</h3>
                    <button className="invite-dialog-close" onClick={onClose}>
                        <FiX />
                    </button>
                </div>

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
                        <div className="invite-loading">
                            <div className="invite-loading-spinner"></div>
                            <span>Searching...</span>
                        </div>
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
                            <div ref={observerRef} style={{ height: '10px' }}></div>
                            {(loading || (isSearchLoading && displayedUsers.length > 0)) && (
                                <div className="invite-loading">
                                    <div className="invite-loading-spinner"></div>
                                    <span>Loading more...</span>
                                </div>
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

            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </div>
    );
};

export default InviteDialog;