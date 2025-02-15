'use client';

import { useState } from 'react';
import { Image, Heart, MessageCircle, Share2, Search } from 'lucide-react';
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
  const [postText, setPostText] = useState('');
  const [privacy, setPrivacy] = useState('public');
  const [selectedImage, setSelectedImage] = useState(null);
  const [showFollowersDialog, setShowFollowersDialog] = useState(false);
  const [selectedFollowers, setSelectedFollowers] = useState([]);
  const [displayedFollowers, setDisplayedFollowers] = useState(allFollowers.slice(0, 20));
  const [searchQuery, setSearchQuery] = useState('');

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
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

  const handlePost = () => {
    console.log({ 
      postText, 
      privacy, 
      selectedImage, 
      selectedFollowers: privacy === 'private' ? selectedFollowers : [] 
    });
    setPostText('');
    setSelectedImage(null);
    setPrivacy('public');
    setSelectedFollowers([]);
  };

  return (
    <div className="container">
      <LeftSidebar />
      <main className="main-content">
        <div className="create-post">
          <textarea
            className="post-input"
            placeholder="What's on your mind?"
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
          />
          {selectedImage && (
            <img src={selectedImage} alt="Selected" style={{ maxWidth: '100%', marginBottom: '15px', borderRadius: '8px' }} />
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

        {samplePosts.map((post) => (
          <div key={post.id} className="post">
            <div className="post-header">
              <img
                src={post.user.avatar}
                alt={post.user.name}
                className="post-avatar"
              />
              <div className="post-user-info">
                <div className="post-username">{post.user.name}</div>
                <div className="post-time">{post.time}</div>
              </div>
            </div>
            <div className="post-content">
              {post.content}
            </div>
            <img
              src={post.image}
              alt="Post content"
              className="post-image"
            />
            <div className="post-footer">
              <div className="post-action">
                <Heart size={20} />
                <span>{post.likes}</span>
              </div>
              <div className="post-action">
                <MessageCircle size={20} />
                <span>{post.comments}</span>
              </div>
              <div className="post-action">
                <Share2 size={20} />
                <span>{post.shares}</span>
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

const samplePosts = [
  {
    id: 1,
    user: { name: 'Emma Watson', avatar: 'https://source.unsplash.com/random/40x40?woman' },
    content: 'Just finished reading an amazing book! 📚 Sometimes the perfect weekend is just you, a good book, and a cup of coffee. What are you all reading these days?',
    image: 'https://source.unsplash.com/random/600x400?book',
    time: '2 hours ago',
    likes: 234,
    comments: 45,
    shares: 12
  },
  {
    id: 2,
    user: { name: 'James Smith', avatar: 'https://source.unsplash.com/random/40x40?man' },
    content: '🌄 Early morning hike was totally worth it! The view from the top was breathtaking. Nature never fails to amaze me. #Adventure #Nature #Hiking',
    image: 'https://source.unsplash.com/random/600x400?mountain',
    time: '5 hours ago',
    likes: 456,
    comments: 67,
    shares: 23
  },
  {
    id: 3,
    user: { name: 'Sophia Chen', avatar: 'https://source.unsplash.com/random/40x40?girl' },
    content: '🎨 Finally finished my latest art piece! Been working on this for weeks. Art is such a beautiful way to express emotions. What do you think?',
    image: 'https://source.unsplash.com/random/600x400?art',
    time: '8 hours ago',
    likes: 789,
    comments: 89,
    shares: 34
  },
  {
    id: 4,
    user: { name: 'Marcus Johnson', avatar: 'https://source.unsplash.com/random/40x40?boy' },
    content: '🍳 Sunday brunch vibes! Tried this new recipe and it turned out amazing. Nothing beats homemade food. Who else loves cooking on weekends?',
    image: 'https://source.unsplash.com/random/600x400?food',
    time: '12 hours ago',
    likes: 567,
    comments: 78,
    shares: 15
  },
  {
    id: 5,
    user: { name: 'Isabella Garcia', avatar: 'https://source.unsplash.com/random/40x40?woman-2' },
    content: '🌺 Spring is finally here! The garden is blooming and everything feels so fresh and new. Nature\'s colors are truly inspiring.',
    image: 'https://source.unsplash.com/random/600x400?garden',
    time: '1 day ago',
    likes: 890,
    comments: 123,
    shares: 45
  }
];