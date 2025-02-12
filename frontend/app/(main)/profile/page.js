'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Mail, Calendar } from 'lucide-react';
import { Avatar } from '../../../components/ui/avatar';
import Post from '../../../components/Post';
import UpdateInfoDialog from '../../../components/UpdateInfoDialog';
import { BASE_URL } from '../../../config';
import { Skeleton } from '../../../components/ui/skeleton';
import { Button } from '../../../components/ui/button';

export default function ProfilePage() {

  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    email: "",
    date_of_birth: "",
    is_public: true,
    following: 0,
    followers: 0
  });
  const [posts, setPosts] = useState([]);
  const [postsPgae, setPostsPage] = useState(0);
  const [updateInfo, setUpdateInfo] = useState(false);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    axios.get(`${BASE_URL}/user-info`)
      .then(res => {
        const data = res.data;
        data.avatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop'; // to be removed after implementing avatar import
        setProfile(data);
      }).catch(err => {
        console.error('Error fetching user info:', err);
      }).finally(() => {
        setLoading(false);
      })
  }, []);

  useEffect(() => {
    if (!profile.first_name) return;

    axios.get(`${BASE_URL}/user-posts/${postsPgae}`)
      .then(res => {
        const data = res.data;
        const user = {
          name: profile.first_name + " " + profile.last_name,
          avatar: profile.avatar,
        };
        if (data && Array.isArray(data)) {
          const updatedPosts = data.map(post => ({
            ...post,
            user: user
          }));

          setPosts(updatedPosts);
        }
      })
      .catch(err => {
        console.error('Error fetching posts of the user:', err);
      });
  }, [profile]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="relative mb-6">
        <div className="h-80 overflow-hidden rounded-b-lg">
          <img
            src='https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&h=300&fit=crop'
            alt="Cover"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute bottom-4 left-4 flex items-end gap-4">
          <Avatar className="h-40 w-40 border-4 border-white">

            {loading ?
              <div className='bg-white w-full h-full flex justify-center align-middle'>
                <Skeleton className='w-full h-full rounded-full' />
              </div>
              : <img src={profile.avatar || 'default-avatar.jpg'} alt={profile.first_name + " " + profile.last_name} className="h-full w-full" />
            }
          </Avatar>
          <div className="mb-4 text-white">
            <h1 className="text-3xl font-bold drop-shadow-lg">{profile.first_name + " " + profile.last_name}</h1>
            <p className="text-lg drop-shadow-lg">{profile.nickname}</p>
          </div>
        </div>
        <Button className="absolute bottom-4 right-4" onClick={() => setUpdateInfo(true)}>
          Edit Profile
        </Button>
      </div>

      <div className="px-4">
        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
          <div className="flex items-center gap-1">

            <Mail className="h-4 w-4" />
            <a href={`mailto:${profile.email}`} className="text-blue-600 hover:underline">
              {profile.email}
            </a>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Born on {new Date(profile.date_of_birth).toLocaleDateString()}
          </div>
        </div>

        <div className="flex gap-6 mb-4 ">
          <div>
            <span className="font-bold">{profile.followers}</span>
            <span className="text-gray-600 ml-1">Followers</span>
          </div>
          <div>
            <span className="font-bold">{profile.following}</span>
            <span className="text-gray-600 ml-1">Following</span>
          </div>
        </div>
        {profile.about &&
          <div>
            <h3 className='text-xl font-bold drop-shadow-lg text-gray-600'>About</h3>
            <p className="text-sm drop-shadow-lg text-gray-600 m-3">{profile.about}</p>
          </div>
        }
        <h3 className='text-xl font-bold drop-shadow-lg text-gray-600 mb-3 border-t border-spacing-2 pt-2'>{profile?.first_name}'s posts</h3>
        {posts.length > 0 ?
          <div className="space-y-4 ">
            {posts.map((post) => (
              <Post key={post.id} post={post} />
            ))}
          </div>
          : <div className="flex items-center gap-1">
            <p className='text-sm text-gray-400 ml-3'>{profile.first_name} {profile.last_name} didn't post anything yet!</p>
          </div>
        }
      </div>

      {updateInfo && (
        <UpdateInfoDialog
          user={profile}
          onClose={() => setUpdateInfo(false)}
          setProfile={setProfile}
        />
      )}
    </div >
  );
}