'use client';

import { useEffect, useState } from 'react';
import "./profile.css"
import ProfileHeader from '@/components/profile/profileHeader/profileHeader';
import ProfileAbout from '@/components/profile/profileAbout/profileAbout';
import Posts from '@/components/posts/posts';
import * as cookies from '@/lib/cookie';
import { fetchBlob } from '@/lib/fetch_blob';
import UserNotFound from '@/components/profile/NotFound';
import PrivateAccount from '@/components/profile/PrivateAccount';

export default function ProfilePage({ params }) {
  const [cookieValue, setCookieValue] = useState(null);
  const [userID, setUserID] = useState();
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
    nickname: "",
    follow_status: "",
    is_following: false,
  });

  const [posts, setPosts] = useState([]);
  const [postsPage, setPostsPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [endReached, setEndReached] = useState(false);
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
        data = data.data
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
    if (!profile.is_owner && (!profile.first_name || (!profile.is_public && !profile.is_following))) return;
    if (endReached) return;
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/user-posts/${userID}/${postsPage}`, {
      method: "GET",
      credentials: "include",
      headers: { 'Authorization': `Bearer ${cookieValue}` }
    })
      .then(res => res.json())
      .then(async data => {
        const posts = data.data
        const user = {
          name: profile.first_name + " " + profile.last_name,
          avatar: profile.avatar,
        };
        if (posts && posts.length > 0) {
          const updatedPosts = await Promise.all(posts.map(async post => {
            if (post.image) {
              post.image = await fetchBlob(process.env.NEXT_PUBLIC_BACK_END_DOMAIN + post.image);
            }
            return {
              ...post,
              author: user.name,
              avatar: user.avatar
            };
          }));

          if (postsPage === 0) {
            setPosts(updatedPosts);
          } else {
            setPosts(prevPosts => {
              const seen = new Set(prevPosts.map(p => p.post_id));
              const filteredNewPosts = updatedPosts.filter(post => !seen.has(post.post_id));
              return [...prevPosts, ...filteredNewPosts];
            });
          }
          setHasMore(updatedPosts.length === 20);
        } else {
          setHasMore(false);
          setEndReached(true);
        }
      })
      .catch(err => {
        console.error('Error fetching posts of the user:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [profile, postsPage, userID, cookieValue]);

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      setPostsPage(prev => prev + 20);
    }
  };

  return (
    <div className="profile-container">
      {!notFound ?
        <>
          <ProfileHeader profile={profile} setProfile={setProfile} cookieValue={cookieValue} userID={userID} />

          {!profile.is_owner && !profile.is_public && !profile.is_following
            ? <PrivateAccount />
            :
            <>
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
                  <Posts
                    posts={posts}
                    loading={loading}
                    endReached={endReached}
                    onLoadMore={handleLoadMore}
                    target="Post"
                  />
                </>
              }
            </>
          }
        </>

        : <UserNotFound />
      }
    </div>
  );
}
