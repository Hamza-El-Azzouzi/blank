"use client"
import React, { useState, useEffect } from 'react';
import { FiImage, FiSearch } from 'react-icons/fi';
import { Dialog, DialogTitle, Button, Checkbox } from './Dialog';
import './posts.css';
import * as cookies from '@/lib/cookie';
import { fetchBlob } from '@/lib/fetch_blob';

const CreatePost = ({ onPostCreated }) => {
    const [cookieValue, setCookieValue] = useState(null);
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

    useEffect(() => {
        setCookieValue(cookies.GetCookie("sessionId"));
    }, [cookieValue]);

    useEffect(() => {
        const fetchFollowers = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/followerlist?page=${page}`, {
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
                }
                if (page === 1) {
                    setFollowers(followersData);
                    setDisplayedFollowers(followersData);
                } else {
                    setFollowers(prev => [...prev, ...followersData]);
                    setDisplayedFollowers(prev => [...prev, ...followersData]);
                }
            } catch (error) {
                console.error('Error fetching followers:', error);
                setFollowers([]);
                setDisplayedFollowers([]);
                setHasMore(false);
            }
        };

        if (cookieValue) {
            fetchFollowers();
        }
    }, [cookieValue, page]);

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
            setShowFollowersDialog(true);
        }
    };

    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        if (scrollHeight - scrollTop === clientHeight && hasMore) {
            setPage(prev => prev + 1);
        }
    };

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);
        setPage(1);

        if (query) {
            const filtered = followers.filter(follower =>
                follower.name.toLowerCase().includes(query) ||
                follower.username.toLowerCase().includes(query)
            );
            setDisplayedFollowers(filtered);
        } else {
            setDisplayedFollowers(followers);
        }
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
            console.error('Error creating post:', error);
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
                            <option value="almost private">Followers Only</option>
                            <option value="private">Selected Followers</option>
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
                                onChange={() => handleFollowerSelect(follower.user_id)}
                            />
                        </div>
                    ))}
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
        </div>
    );
};

export default CreatePost;