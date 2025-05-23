"use client"
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FiImage, FiSearch } from 'react-icons/fi';
import { Dialog, DialogTitle, Button, Checkbox } from './Dialog';
import './posts.css';
import * as cookies from '@/lib/cookie';
import { fetchBlob } from '@/lib/fetch_blob';
import Toast from '../toast/Toast';

const CreatePost = ({ onPostCreated }) => {
    const cookieValue = cookies.GetCookie("sessionId");
    const [followers, setFollowers] = useState([]);
    const [displayedFollowers, setDisplayedFollowers] = useState([]);
    const [selectedFollowers, setSelectedFollowers] = useState([]);
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [privacy, setPrivacy] = useState('Public');
    const [showFollowersDialog, setShowFollowersDialog] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [lastUserId, setLastUserId] = useState('');
    const debounceTimeoutRef = useRef(null);
    const [isSearchLoading, setIsSearchLoading] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [lastSearchId, setLastSearchId] = useState('');
    const [hasMoreSearch, setHasMoreSearch] = useState(true);
    const [toasts, setToasts] = useState([]);

    const showToast = (type, message) => {
        const newToast = { id: Date.now(), type, message };
        setToasts((prevToasts) => [...prevToasts, newToast]);
    };
    const removeToast = (id) => {
        setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    };

    const getUserID = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/integrity`, {
                method: "POST",
                credentials: "include",
                headers: {
                    'Content-Type': "application/json"
                },
                body: JSON.stringify({
                    name: "token",
                    value: cookieValue
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch user ID');
            }

            return data.data
        } catch (error) {
            showToast('error', "An Error Occure, Try Later!!");
        }
    };

    useEffect(() => {
        if (!showFollowersDialog || !cookieValue) return;
        const fetchFollowers = async () => {
            try {
                const userId = await getUserID();
                const url = page === 1
                    ? `${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/followerlist/${userId}`
                    : `${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/followerlist/${userId}?offset=${lastUserId}`;

                const response = await fetch(url, {
                    headers: {
                        'Authorization': `Bearer ${cookieValue}`,
                    },
                });
                if (!response.ok) throw new Error('Failed to fetch followers');
                const data = await response.json();

                let followersData = data.data.follow_list || [];
                followersData = await Promise.all(followersData.map(async (user) => {
                    user.avatar = user.avatar
                        ? await fetchBlob(process.env.NEXT_PUBLIC_BACK_END_DOMAIN + user.avatar)
                        : '/default-avatar.jpg';
                    return user;
                }));

                if (followersData.length < 20) {
                    setHasMore(false);
                } else {
                    setLastUserId(data.data.last_user_id);
                }
                setFollowers(prev => page === 1 ? followersData : [...prev, ...followersData]);
                setDisplayedFollowers(prev => page === 1 ? followersData : [...prev, ...followersData]);
            } catch (error) {
                showToast('error', "An Error Occure, Try Later!!");
            }
        };

        fetchFollowers();
    }, [cookieValue, page, showFollowersDialog]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
    };

    const removeImage = () => {
        setImage(null);
    };

    const handlePrivacyChange = (e) => {
        const value = e.target.value;
        setPrivacy(value);
        if (value === 'private') {
            setPage(1);
            setShowFollowersDialog(true);
        }
    };

    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        if (scrollHeight - scrollTop === clientHeight) {
            if (searchQuery) {
                if (hasMoreSearch && !isSearchLoading) {
                    performSearch(searchQuery);
                }
            } else if (hasMore) {
                setPage(prev => prev + 1);
            }
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

    const performSearch = async (query, isNewSearch = false) => {
        if (query.length < 1) {
            setDisplayedFollowers(followers);
            setSearchResults([]);
            setIsSearchLoading(false);
            return;
        }

        if (isNewSearch) {
            setLastSearchId('');
            setSearchResults([]);
            setHasMoreSearch(true);
        }

        if (!hasMoreSearch && !isNewSearch) return;

        try {
            const userId = await getUserID();
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/searchfollowers/${userId}?offset=${isNewSearch ? '' : lastSearchId}&q=${query}`,
                {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Authorization': `Bearer ${cookieValue}`
                    }
                }
            );

            if (!response.ok) throw new Error('Failed to fetch followers');
            const data = await response.json();

            let followersData = data.data.follow_list || [];
            followersData = await Promise.all(followersData.map(async (user) => {
                user.avatar = user.avatar
                    ? await fetchBlob(process.env.NEXT_PUBLIC_BACK_END_DOMAIN + user.avatar)
                    : '/default-avatar.jpg';
                return user;
            }));

            if (data.data.last_user_id) {
                setLastSearchId(data.data.last_user_id);
                setHasMoreSearch(followersData.length === 20);
            } else {
                setHasMoreSearch(false);
            }

            setSearchResults(prev => isNewSearch ? followersData : [...prev, ...followersData]);
            setDisplayedFollowers(prev => isNewSearch ? followersData : [...prev, ...followersData]);
        } catch (error) {
            showToast('error', "An Error Occure, Try Later!!");
        } finally {
            setIsSearchLoading(false);
        }
    };

    useEffect(() => {
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, []);

    const handleSearch = (e) => {
        setDisplayedFollowers([]);
        const query = e.target.value;
        setSearchQuery(query);
        setLastSearchId('');
        if (query.length < 1) {
            setDisplayedFollowers(followers);
            setSearchResults([]);
            setIsSearchLoading(false);
            return;
        }
        setIsSearchLoading(true);
        debouncedSearch(query);
    };

    const handleFollowerSelect = (followerId) => {
        setSelectedFollowers(prev => {
            if (prev.includes(followerId)) {
                return prev.filter(id => id !== followerId);
            }
            return [...prev, followerId];
        });
    };

    const handlePost = async () => {
        const postData = {
            content,
            image,
            privacy,
            selectedFollowers: privacy === 'private' ? selectedFollowers : []
        };

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/createpost`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${cookieValue}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(postData)
            });

            if (!response.ok) {
                throw new Error('Failed to create post');
            }

            const data = await response.json();
            const post = data.data;
            const newPost = {
                post_id: post.post_id,
                author: post.author,
                avatar: post.avatar ? await fetchBlob(process.env.NEXT_PUBLIC_BACK_END_DOMAIN + post.avatar) : '/default-avatar.jpg',
                content: post.content,
                image: post.image ? await fetchBlob(process.env.NEXT_PUBLIC_BACK_END_DOMAIN + post.image) : null,
                formatted_date: post.formatted_date,
                like_count: post.like_count,
                comment_count: post.comment_count,
                isLiked: post.HasLiked,
                privacy: post.privacy,
            };

            if (onPostCreated) onPostCreated(newPost);

            setContent('');
            setImage(null);
            setPrivacy('public');
            setSelectedFollowers([]);
        } catch (error) {
            showToast('error', "An Error Occure, Try Later!!");
        }
    };

    return (
        <div className="create-post-container">
            <form onSubmit={handleSubmit}>
                <textarea placeholder="What's on your mind?" value={content}
                    onChange={(e) => setContent(e.target.value)} className="post-textarea"
                    maxLength={400} />

                {image && (
                    <div className="image-preview-wrapper">
                        <img src={image} alt="Preview" className="preview-image" />
                        <button type="button" onClick={removeImage} className="remove-image" aria-label="Remove image">
                            ×
                        </button>
                    </div>
                )}

                <div className="create-post-footer">
                    <div className="create-post-actions">
                        <label className="upload-image-label">
                            <FiImage className="action-icon" />
                            <input type="file" accept="image/*"
                                onChange={handleImageChange} className="hidden-input" />
                        </label>

                        <select
                            className="privacy-select"
                            value={privacy}
                            onChange={handlePrivacyChange}
                        >
                            <option value="public">Public</option>
                            <option value="almost private">Almost Private</option>
                            <option value="private">Private</option>
                        </select>

                    </div>

                    <button type="submit" className="post-submit-button"
                        disabled={!content.trim() && !image} onClick={handlePost}>
                        Post
                    </button>
                </div>
            </form>

            <Dialog open={showFollowersDialog} onClose={() => setShowFollowersDialog(false)}>
                <DialogTitle>Select Followers</DialogTitle>
                <div className="followers-search">
                    <FiSearch className="search-icon" size={20} />
                    <input
                        type="text"
                        placeholder="Search followers..."
                        value={searchQuery}
                        onChange={handleSearch}
                        className="followers-search-input"
                    />
                </div>
                <div className="followers-list" onScroll={handleScroll}>
                    {isSearchLoading && !displayedFollowers.length ? (
                        <div className="follower-item">Loading...</div>
                    ) : searchQuery && displayedFollowers.length === 0 ? (
                        <div className="follower-item">No results found</div>
                    ) : (
                        <>
                            {displayedFollowers.map((follower) => (
                                <div
                                    key={follower.user_id}
                                    className={`follower-item ${selectedFollowers.includes(follower.user_id) ? 'selected' : ''}`}
                                    onClick={() => handleFollowerSelect(follower.user_id)}
                                >
                                    <div className="follower-info">
                                        <img src={follower.avatar} alt={follower.first_name} className="follower-avatar" />
                                        <div className="follower-details">
                                            <div className="follower-name">{follower.first_name} {follower.last_name}</div>
                                        </div>
                                    </div>
                                    <Checkbox
                                        checked={selectedFollowers.includes(follower.user_id)}
                                        onClick={() => {
                                            handleFollowerSelect(follower.user_id);
                                        }}
                                    />
                                </div>
                            ))}
                            {((!searchQuery && hasMore) || (searchQuery && hasMoreSearch)) &&
                                (isSearchLoading || page > 1) && (
                                    <div className="follower-item loading">Loading more...</div>
                                )}
                        </>
                    )}
                </div>
                <div className="dialog-footer">
                    <Button variant="secondary" onClick={() => setShowFollowersDialog(false)}>
                        Cancel
                    </Button>
                    <Button onClick={() => setShowFollowersDialog(false)}>
                        Done ({selectedFollowers.length})
                    </Button>
                </div>
            </Dialog>
            {
                toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        message={toast.message}
                        type={toast.type}
                        onClose={() => removeToast(toast.id)}
                    />
                ))
            }
        </div>
    );
};

export default CreatePost;