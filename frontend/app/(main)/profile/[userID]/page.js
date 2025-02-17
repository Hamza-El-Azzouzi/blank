/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import "./profile.css"
import { MdOutlineMail } from "react-icons/md";
import { FaUserEdit } from "react-icons/fa";
import UpdateInfoDialog from '@/components/profile/UpdateInfoDialog';
import Post from '@/components/posts/post';

export default function ProfilePage({ params }) {

  const isOwner = true
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
    nickname: ""
  });

  const [posts, setPosts] = useState([]);
  const [postsPgae, setPostsPage] = useState(0);
  const [updateInfo, setUpdateInfo] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserID = async () => {
      const query = await params;
      setUserID(query.userID);
    };
    getUserID();
  }, [params]);

  useEffect(() => {
    if (!userID) return;

    fetch(`${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/user-info/${userID}`)
      .then(res => res.json())
      .then(data => {
        data.avatar = data.avatar ? BASE_URL + data.avatar : '/default-avatar.jpg';
        setProfile(data);
      })
      .catch(err => {
        console.error('Error fetching user info:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userID]);

  useEffect(() => {
    if (!profile.first_name) return;

    fetch(`${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/user-posts/${userID}/${postsPgae}`)
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
  }, [postsPgae, profile, userID]);

  return (
    <div className="container">
      <div className="profile-header">
        <img
          src="/cover.jpg"
          alt="Cover"
          className="cover-photo"
        />
        <div className="profile-info">
          <div className="avatar">
            {loading ? (
              <div className="loading-avatar"></div>
            ) : (
              <img
                src={profile.avatar}
                alt={`${profile.first_name} ${profile.last_name}`}
              />
            )}
          </div>
          <div className="name">
            <h1>{profile.first_name} {profile.last_name}</h1>
            <p>{profile.nickname}</p>
          </div>
        </div>
        {isOwner &&
          <button className="btn edit-btn" onClick={() => setUpdateInfo(true)}><FaUserEdit /></button>
        }
      </div>

      <div className="profile-details">
        <div className='date-email'>
          {profile.date_of_birth && <a href={`mailto:${profile.email}`} className='email'><MdOutlineMail /> {profile.email}</a>}
          {profile.date_of_birth && <p className='born-date'>Born on {new Date(profile.date_of_birth)?.toLocaleDateString()}</p>}
        </div>
        <div className='follow'>
          <p>{profile.followers} Followers</p>
          <p>{profile.following} Following</p>
        </div>
        {profile.about && (
          <div className='about'>
            <h3>About</h3>
            <p>{profile.about}</p>
          </div>
        )}
      </div>

      {profile.first_name &&
        <>
          <h3>{profile.first_name}&lsquo;s posts</h3>
          <div className="posts">
            {posts.length > 0 ? (
              posts.map(post => (
                <Post key={post.id} post={post} />
              ))
            ) : (
              <p>{profile.first_name} {profile.last_name} hasn&rsquo;t posted anything yet!</p>
            )}
          </div>
        </>
      }

      {updateInfo && (
        <UpdateInfoDialog
          user={profile}
          onClose={() => setUpdateInfo(false)}
          setProfile={setProfile}
        />
      )}
    </div>
  );
}
