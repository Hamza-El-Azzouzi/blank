'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { MapPin, Link as LinkIcon, Calendar } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Avatar } from '../../components/ui/avatar';
import Image from 'next/image';
import Post from '../../components/Post';

const MOCK_PROFILE = {
  id: 1,
  name: 'John Doe',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop',
  cover: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&h=300&fit=crop',
  bio: 'Software Developer | Photography Enthusiast | Travel Lover',
  location: 'San Francisco, CA',
  website: 'johndoe.dev',
  joinedDate: 'Joined January 2020',
  followers: 1234,
  following: 567,
  posts: [
    {
      id: 1,
      user: {
        id: 1,
        name: 'John Doe',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop',
      },
      content: 'Working on some exciting new projects! 💻',
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=800&fit=crop',
      likes: 52,
      comments: 12,
      timestamp: '3d ago',
      privacy: 'public',
    }
  ]
};

export default function ProfilePage() {

  useEffect(() => {
    axios.get(`http://127.0.0.1:1414/api/user-info`)
      .then(res => {
        const data = res.data;
        // setProfile(data);
        console.log(data);

      })
      .catch(err => {
        console.error('Error fetching user info:', err);
      })
  }, [])

  const [profile, setProfile] = useState(MOCK_PROFILE);
  const [activeTab, setActiveTab] = useState('posts');

  return (
    <div className="max-w-4xl mx-auto">
      <div className="relative mb-6">
        <div className="h-80 overflow-hidden rounded-b-lg">
          <img
            src={profile.cover}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute bottom-4 left-4 flex items-end gap-4">
          <Avatar className="h-40 w-40 border-4 border-white">
            <img src={profile.avatar} alt={profile.name} className="h-full w-full" />
          </Avatar>
          <div className="mb-4 text-white">
            <h1 className="text-3xl font-bold drop-shadow-lg">{profile.name}</h1>
            <p className="text-lg drop-shadow-lg">{profile.bio}</p>
          </div>
        </div>
        <Button className="absolute bottom-4 right-4">
          Edit Profile
        </Button>
      </div>

      <div className="px-4">
        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {profile.location}
          </div>
          <div className="flex items-center gap-1">
            <LinkIcon className="h-4 w-4" />
            <a href={`https://${profile.website}`} className="text-blue-600 hover:underline">
              {profile.website}
            </a>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {profile.joinedDate}
          </div>
        </div>

        <div className="flex gap-6 mb-4">
          <div>
            <span className="font-bold">{profile.followers.toLocaleString()}</span>
            <span className="text-gray-600 ml-1">Followers</span>
          </div>
          <div>
            <span className="font-bold">{profile.following.toLocaleString()}</span>
            <span className="text-gray-600 ml-1">Following</span>
          </div>
        </div>

        <div className="border-b mb-6">
          <div className="flex gap-8">
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'posts'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600'
                }`}
              onClick={() => setActiveTab('posts')}
            >
              Posts
            </button>
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'photos'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600'
                }`}
              onClick={() => setActiveTab('photos')}
            >
              Photos
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {profile.posts.map((post) => (
            <Post key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
}