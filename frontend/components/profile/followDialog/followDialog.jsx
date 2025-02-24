import { useState, useEffect, useRef } from 'react';
import { fetchBlob } from '@/lib/fetch_blob';
import './followDialog.css';

const FollowDialog = ({ type, onClose, cookieValue, setProfile, userID, isOwner }) => {
    const [users, setUsers] = useState([]);
    const [lastUserId, setLastUserId] = useState('');
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const observerRef = useRef();

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

                if (data.data.last_user_id) {
                    setLastUserId(data.data.last_user_id);
                    setHasMore(true);
                } else {
                    setHasMore(false);
                }

                setHasMore(newUsers.length === 20);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
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
                setProfile(prev => ({
                    ...prev,
                    [type]: prev[type] - 1
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
                if (entries[0].isIntersecting && hasMore && !loading) {
                    fetchUsers();
                }
            },
            { threshold: 0.1 }
        );

        if (observerRef.current) {
            observer.observe(observerRef.current);
        }

        return () => observer.disconnect();
    }, [hasMore, loading, lastUserId]);

    return (
        <div className="follow-dialog-overlay" onClick={onClose}>
            <div className="follow-dialog" onClick={e => e.stopPropagation()}>
                <h3>{type === 'followers' ? 'Followers' : 'Following'} list</h3>

                <div className="follow-list">
                    {users.map(user => (
                        <div key={user.user_id} className="follow-item">
                            <div className="follow-user-info">
                                <img src={user.avatar} alt={`${user.first_name}'s avatar`} className="follow-avatar" />
                                <span className="follow-name">{user.first_name} {user.last_name}</span>
                            </div>
                            {isOwner && (
                                <button className="follow-remove-btn" onClick={() => handleRemoveUser(user.user_id)}>
                                    Remove
                                </button>
                            )}
                        </div>
                    ))}

                    {loading && <div className="follow-loading">loading...</div>}
                    <div ref={observerRef} className="follow-observer"></div>
                </div>

                {!hasMore && users.length === 0 && (
                    <div className="follow-empty-message">
                        No {type} found
                    </div>
                )}

                <button className="follow-close-btn" onClick={onClose}>Close</button>
            </div>
        </div>
    );
}

export default FollowDialog