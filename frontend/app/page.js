'use client';

import { useState } from 'react';
import { Image, Heart, MessageCircle, Share2 } from 'lucide-react';

const samplePosts = [
  {
    id: 1,
    user: { name: 'Emma Watson', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop' },
    content: 'Just finished reading an amazing book! 📚 Sometimes the perfect weekend is just you, a good book, and a cup of coffee. What are you all reading these days?',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=800&fit=crop',
    time: '2 hours ago',
    likes: 234,
    comments: 45,
    shares: 12
  },
  {
    id: 2,
    user: { name: 'James Smith', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop' },
    content: '🌄 Early morning hike was totally worth it! The view from the top was breathtaking. Nature never fails to amaze me. #Adventure #Nature #Hiking',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=800&fit=crop',
    time: '5 hours ago',
    likes: 456,
    comments: 67,
    shares: 23
  },
  {
    id: 3,
    user: { name: 'Sophia Chen', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop' },
    content: '🎨 Finally finished my latest art piece! Been working on this for weeks. Art is such a beautiful way to express emotions. What do you think?',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=800&fit=crop',
    time: '8 hours ago',
    likes: 789,
    comments: 89,
    shares: 34
  },
  {
    id: 4,
    user: { name: 'Marcus Johnson', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop' },
    content: '🍳 Sunday brunch vibes! Tried this new recipe and it turned out amazing. Nothing beats homemade food. Who else loves cooking on weekends?',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=800&fit=crop',
    time: '12 hours ago',
    likes: 567,
    comments: 78,
    shares: 15
  },
  {
    id: 5,
    user: { name: 'Isabella Garcia', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop' },
    content: '🌺 Spring is finally here! The garden is blooming and everything feels so fresh and new. Nature\'s colors are truly inspiring.',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=800&fit=crop',
    time: '1 day ago',
    likes: 890,
    comments: 123,
    shares: 45
  }
];

export default function Home() {
  const [postText, setPostText] = useState('');
  const [privacy, setPrivacy] = useState('public');
  const [selectedImage, setSelectedImage] = useState(null);

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

  const handlePost = () => {
    console.log({ postText, privacy, selectedImage });
    setPostText('');
    setSelectedImage(null);
    setPrivacy('public');
  };

  return (
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
                onChange={(e) => setPrivacy(e.target.value)}
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
  );
}