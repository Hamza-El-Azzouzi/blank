'use client';

import { useEffect, useState } from 'react';
import "./profile.css"
import Post from '@/components/posts/post';
import ProfileHeader from '@/components/profile/profileHeader/profileHeader';
import ProfileAbout from '@/components/profile/profileAbout/profileAbout';
import * as cookies from '@/lib/cookie';
import { fetchBlob } from '@/lib/fetch_blob';
import UserNotFound from '@/components/profile/NotFound';

export default function ProfilePage({ params }) {

  const [cookieValue, setCookieValue] = useState(null);
  const [userID, setUserID] = useState()
  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    email: "",
    date_of_birth: "",
    is_public: true,
    following: 0,
    followers: 0,
    about: "",
    is_owner: false,
    nickname: ""
  });

  const [posts, setPosts] = useState([]);
  const [postsPgae, setPostsPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [notFound, setNotFound] = useState(false);


  useEffect(() => {
    setCookieValue(cookies.GetCookie("sessionId"));
  }, [cookieValue]);

  useEffect(() => {
    const getUserID = async () => {
      const query = await params;
      setUserID(query.userID);
    };
    getUserID();
  }, []);

  useEffect(() => {
    if (!userID) return;

    fetch(`${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}/api/user-info/${userID}`, {
      method: "GET",
      credentials: "include",
      headers: { 'Authorization': `Bearer ${cookieValue}` }
    })
      .then(res => res.json())
      .then(async (data) => {
        if (data.status == 400 || data.status == 404) {
          setNotFound(true);
          return;
        }

        data.avatar = data.avatar
          ? await fetchBlob(process.env.NEXT_PUBLIC_BACK_END_DOMAIN + data.avatar)
          : '/default-avatar.jpg';

        setProfile(data);
      })
      .catch(err => {
        console.error('Error fetching user info:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userID, cookieValue]);


  useEffect(() => {
    if (!profile.first_name) return;

    fetch(`${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/user-posts/${userID}/${postsPgae}`, {
      method: "GET",
      credentials: "include",
      headers: { 'Authorization': `Bearer ${cookieValue}` }

    })
      .then(res => res.json())
      .then(data => {
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
    <div className="container">
      {!notFound ?
        <>
          <ProfileHeader profile={profile} setProfile={setProfile} cookieValue={cookieValue} />

          <div className="profile-tabs">
            <button className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`} onClick={() => setActiveTab('posts')}>
              Posts
            </button>
            <button className={`tab-btn ${activeTab === 'about' ? 'active' : ''}`} onClick={() => setActiveTab('about')}>
              About
            </button>
          </div>
          {activeTab === 'about' &&
            <ProfileAbout profile={profile} />
          }

          {activeTab === 'posts' && profile.first_name &&
            <>
              <h3>{profile.first_name}'s posts</h3>
              <div className="posts">
                {posts.length > 0 ? (
                  posts.map(post => (
                    <Post key={post.id} post={post} />
                  ))
                ) : (
                  <p>{profile.first_name} {profile.last_name} hasn't posted anything yet!</p>
                )}
              </div>
            </>
          }
        </>

        : <UserNotFound />
      }
    </div>
  );
}
