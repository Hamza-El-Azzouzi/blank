'use client';

import { useState,useEffect } from 'react';
import { Image, Heart, MessageCircle, Share2, Search, X } from 'lucide-react';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import { Dialog, DialogTitle, Button, Checkbox } from './components/Dialog';

const allFollowers = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  name: `Follower ${i + 1}`,
  username: `user${i + 1}`,
  avatar: `https://source.unsplash.com/random/40x40?portrait=${i + 1}`
}));

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [privacy, setPrivacy] = useState('public');
  const [image, setImage] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('http://127.0.0.1:1414/api/posts/0');
        if (!response.ok) throw new Error('Failed to fetch posts');
        const data = await response.json();
        console.log(data);
        setPosts(data);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts();
  }, []);
  const [showFollowersDialog, setShowFollowersDialog] = useState(false);
  const [selectedFollowers, setSelectedFollowers] = useState([]);
  const [displayedFollowers, setDisplayedFollowers] = useState(allFollowers.slice(0, 20));
  const [searchQuery, setSearchQuery] = useState('');

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
  };

  const handlePrivacyChange = (e) => {
    const value = e.target.value;
    setPrivacy(value);
    if (value === 'private') {
      setShowFollowersDialog(true);
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

  const handlePost = async () => {
    const postData = {
      content,
      image,
      privacy,
      selectedFollowers: privacy === 'private' ? selectedFollowers : []
    };

    try {
      const response = await fetch('http://127.0.0.1:1414/api/createpost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData)
      });

      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      const newPost = {
        id: Date.now(),
        user: { 
          name: 'Current User', 
          avatar: 'https://source.unsplash.com/random/40x40?profile' 
        },
        content: content,
        image: image,
        time: 'Just now',
        likes: 0,
        comments: 0,
        shares: 0,
        privacy: privacy,
        selectedFollowers: privacy === 'private' ? selectedFollowers : []
      };
  
      posts.unshift(newPost);

      setContent('');
      setImage(null);
      setPrivacy('public');
      setSelectedFollowers([]);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  return (
    <div className="container">
      <LeftSidebar />
      <main className="main-content">
        <div className="create-post">
          <textarea
            className="post-input"
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          {image && (
            <div className="selected-image-container">
              <button 
                className="remove-image-button"
                onClick={handleRemoveImage}
                aria-label="Remove image"
              >
                <X size={20} />
              </button>
              <img 
                src={image} 
                alt="Selected" 
                className="selected-image"
              />
            </div>
          )}
          <div className="post-actions">
            <div className="post-options">
              <input
                type="file"
                id="image-upload"
                hidden
                accept="image/*"
                onChange={handleImageUpload}
              />
              <label htmlFor="image-upload" style={{ cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <Image size={24} />
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
            <button className="post-button" onClick={handlePost}>
              Post
            </button>
          </div>
        </div>

        {posts.map((post) => (
          <div key={post.PostID} className="post">
            <div className="post-header">
              <img
                src={post.avatar}
                alt={post.FirstName}
                className="post-avatar"
              />
              <div className="post-user-info">
                <div className="post-username">{post.FirstName} {post.LastName}</div>
                <div className="post-time">{post.FormattedDate}</div>
              </div>
            </div>
            <div className="post-content">
              {post.Content}
            </div>
            {post.Image && post.Image !== "" && (
              <img
                src={post.Image}
                alt="Post content"
                className="post-image"
              />
            )}
            <div className="post-footer">
              <div className="post-action">
                <Heart size={20} />
                <span>{post.likes}</span>
              </div>
              <div className="post-action">
                <MessageCircle size={20} />
                <span>{post.comments}</span>
              </div>
          
            </div>
          </div>
        ))}
      </main>
      <RightSidebar />

      <Dialog open={showFollowersDialog} onClose={() => setShowFollowersDialog(false)}>
        <DialogTitle>Select Followers</DialogTitle>
        <div className="followers-search">
          <Search className="search-icon" size={20} />
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
}