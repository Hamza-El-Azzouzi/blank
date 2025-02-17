// components/posts/createPost.jsx
"use client"
import React, { useState, useEffect } from 'react';
import { FiImage, FiSearch } from 'react-icons/fi';
import { Dialog, DialogTitle, Button, Checkbox } from './Dialog';
import './posts.css';
import * as cookies from '@/lib/cookie';

const allFollowers = Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    name: `Follower ${i + 1}`,
    username: `user${i + 1}`,
    avatar: `https://source.unsplash.com/random/40x40?portrait=${i + 1}`
}));

const CreatePost = ({ onPostCreated }) => {  // Add this prop
    const [cookieValue, setCookieValue] = useState(null);
    useEffect(() => {
        setCookieValue(cookies.GetCookie("sessionId"));
    }, [cookieValue]);

    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [privacy, setPrivacy] = useState('Public');
    const [showFollowersDialog, setShowFollowersDialog] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [displayedFollowers, setDisplayedFollowers] = useState(allFollowers.slice(0, 20));
    const [selectedFollowers, setSelectedFollowers] = useState([]);

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
        const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
        if (bottom) {
            const currentLength = displayedFollowers.length;
            const nextFollowers = allFollowers.slice(currentLength, currentLength + 20);
            if (nextFollowers.length > 0) {
                setDisplayedFollowers(prev => [...prev, ...nextFollowers]);
            }
        }
    };

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);
        if (query) {
            const filtered = allFollowers.filter(follower =>
                follower.name.toLowerCase().includes(query) ||
                follower.username.toLowerCase().includes(query)
            ).slice(0, 20);
            setDisplayedFollowers(filtered);
        } else {
            setDisplayedFollowers(allFollowers.slice(0, 20));
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

            const post = await response.json();

            const newPost = {
                PostID: post.PostID,
                Author: post.Author,
                Avatar: 'https://source.unsplash.com/random/40x40?profile',
                Content: post.Content,
                Image: post.Image,
                FormattedDate: post.FormattedDate,
                LikeCount: post.LikeCount,
                CommentCount: post.CommentCount,
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
                            <option value="almost-private">Followers Only</option>
                            <option value="private">Selected Followers</option>
                        </select>

                    </div>

                    <button type="submit" className="post-submit-button"
                        disabled={!content.trim()} onClick={handlePost}>
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
                            key={follower.id}
                            className={`follower-item ${selectedFollowers.includes(follower.id) ? 'selected' : ''}`}
                            onClick={() => handleFollowerSelect(follower.id)}
                        >
                            <div className="follower-info">
                                <img src={follower.avatar} alt={follower.name} className="follower-avatar" />
                                <div className="follower-details">
                                    <div className="follower-name">{follower.name}</div>
                                    <div className="follower-username">@{follower.username}</div>
                                </div>
                            </div>
                            <Checkbox
                                checked={selectedFollowers.includes(follower.id)}
                                onChange={() => handleFollowerSelect(follower.id)}
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