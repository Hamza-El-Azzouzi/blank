import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { fetchBlob } from '@/lib/fetch_blob';
import { FiSearch } from 'react-icons/fi';
import './followDialog.css';

const FollowDialog = ({ type, onClose, cookieValue, setProfile, userID, isOwner }) => {
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
            const endpoint = type === 'followers' ? 'followerlist' : 'followinglist';
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/${endpoint}/${userID}?offset=${lastUserId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${cookieValue}`
                    }
                }
            );

            const data = await response.json();
            if (data.data.follow_list && data.data.follow_list.length > 0) {
                const newUsers = await Promise.all(
                    data.data.follow_list.map(async (user) => ({
                        ...user,
                        avatar: user.avatar
                            ? await fetchBlob(process.env.NEXT_PUBLIC_BACK_END_DOMAIN + user.avatar)
                            : '/default-avatar.jpg'
                    }))
                );

                setUsers(prev => {
                    const uniqueUsers = [...prev];
                    newUsers.forEach(newUser => {
                        if (!uniqueUsers.some(u => u.user_id === newUser.user_id)) {
                            uniqueUsers.push(newUser);
                        }
                    });
                    return uniqueUsers;
                });
                setDisplayedUsers(prev => {
                    const uniqueUsers = [...prev];
                    newUsers.forEach(newUser => {
                        if (!uniqueUsers.some(u => u.user_id === newUser.user_id)) {
                            uniqueUsers.push(newUser);
                        }
                    });
                    return uniqueUsers;
                });

                if (data.data.last_user_id) {
                    setLastUserId(data.data.last_user_id);
                    setHasMore(true);
                } else {
                    setHasMore(false);
                }
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
            const endpoint = type === 'followers' ? 'searchfollowers' : 'searchfollowing';
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/${endpoint}/${userID}?offset=${isNewSearch ? '' : lastSearchId}&q=${query}`,
                {
                    headers: {
                        'Authorization': `Bearer ${cookieValue}`
                    }
                }
            );

            const data = await response.json();
            if (data.data.follow_list && data.data.follow_list.length > 0) {
                const newSearchResults = await Promise.all(
                    data.data.follow_list.map(async (user) => ({
                        ...user,
                        avatar: user.avatar
                            ? await fetchBlob(process.env.NEXT_PUBLIC_BACK_END_DOMAIN + user.avatar)
                            : '/default-avatar.jpg'
                    }))
                );

                if (data.data.last_user_id) {
                    setLastSearchId(data.data.last_user_id);
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

    const handleRemoveUser = async (userId) => {
        try {
            const endpoint = type === 'followers' ? 'deletefollower' : 'deletefollowing';
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/${endpoint}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${cookieValue}`
                    },
                    body: JSON.stringify(
                        type === 'followers' ? { follower_id: userId } : { following_id: userId }
                    )
                }
            );

            if (response.ok) {
                setUsers(prev => prev.filter(user => user.user_id !== userId));
                setDisplayedUsers(prev => prev.filter(user => user.user_id !== userId));
                setProfile(prev => ({
                    ...prev,
                    [type]: Math.max(0, prev[type] - 1)
                }));
            }
        } catch (error) {
            console.error('Error removing user:', error);
        }
    };

    useEffect(() => {
        setUsers([]);
        setLastUserId('');
        setHasMore(true);
    }, [type]);

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
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, []);

    return (
        <div className="follow-dialog-overlay" onClick={onClose}>
            <div className="follow-dialog" onClick={e => e.stopPropagation()}>
                <h3>{type === 'followers' ? 'Followers' : 'Following'} list</h3>

                <div className="followers-search">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={handleSearch}
                        className="followers-search-input"
                    />
                </div>

                <div className="follow-list">
                    {console.log(displayedUsers.length)}
                    {isSearchLoading && !displayedUsers.length ? (
                        <div className="follow-loading">Loading...</div>
                    ) : searchQuery && displayedUsers.length === 0 ? (
                        <div className="follow-empty-message">No results found</div>
                    ) : (
                        <>
                            {displayedUsers.map(user => (
                                <div key={user.user_id} className="follow-item">
                                    <div className="follow-user-info">
                                        <Link
                                            key={user.user_id}
                                            href={`/profile/${user.user_id}`}
                                        >
                                            <img src={user.avatar} alt={`${user.first_name}'s avatar`} className="follow-avatar" />
                                            <span className="follow-name">{user.first_name} {user.last_name}</span>
                                        </Link>
                                    </div>
                                    {isOwner && (
                                        <button className="follow-remove-btn" onClick={() => handleRemoveUser(user.user_id)}>
                                            Remove
                                        </button>
                                    )}
                                </div>
                            ))}
                            <div ref={observerRef} style={{ height: '20px' }}></div>
                            {(loading || (isSearchLoading && displayedUsers.length > 0)) && (
                                <div className="follow-loading">Loading more...</div>
                            )}
                        </>
                    )}
                </div>

                {!hasMore && displayedUsers.length === 0 && !searchQuery && (
                    <div className="follow-empty-message">
                        No {type} found
                    </div>
                )}

                <button className="follow-close-btn" onClick={onClose}>Close</button>
            </div>
        </div>
    );
}

export default FollowDialog;