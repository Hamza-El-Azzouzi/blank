'use client';

import { useState } from 'react';
import Post from '../components/Post';
import CreatePost from '../components/CreatePost';
import ProfileSidebar from '../components/ProfileSidebar';
import ContactsSidebar from '../components/ContactsSidebar';

const MOCK_POSTS = [
  {
    id: 1,
    user: {
      id: 1,
      name: 'John Doe',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop',
    },
    content: 'Just had an amazing weekend! 🌟',
    image: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=1200&h=800&fit=crop',
    likes: 42,
    comments: 8,
    timestamp: '2h ago',
    privacy: 'public',
  },
  {
    id: 2,
    user: {
      id: 2,
      name: 'Sarah Wilson',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    },
    content: 'Beautiful sunset at the beach today! 🌅',
    image: 'https://images.unsplash.com/photo-1616036740257-9449ea1f6605?w=1200&h=800&fit=crop',
    likes: 28,
    comments: 5,
    timestamp: '4h ago',
    privacy: 'public',
  }
];

export default function HomePage() {
  const [posts, setPosts] = useState(MOCK_POSTS);

  return (
    <div className="flex gap-4 mt-8">
      <ProfileSidebar className="hidden lg:block max-w-72" />
      <div className="flex-1 max-w-6xl mx-auto">
        <CreatePost onPost={(newPost) => setPosts([newPost, ...posts])} />
        <div className="space-y-4 mt-4">
          {posts.map((post) => (
            <Post key={post.id} post={post} />
          ))}
        </div>
      </div>
      <ContactsSidebar className="hidden lg:block w-1/4" />
    </div>
  );
}