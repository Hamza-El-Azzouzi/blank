// app/(main)/page.js
'use client'
import CreatePost from '@/components/posts/createPost';
import Post from '@/components/posts/post';
import { useState, useEffect } from 'react';
import * as cookies from '@/lib/cookie';

export default function Home() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const sessionId = cookies.GetCookie("sessionId");
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/posts/0`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${sessionId}`,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch posts');
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts();
  }, []);

  const handleNewPost = (newPost) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  return (
    <div className="feed-container">
      <CreatePost onPostCreated={handleNewPost} />
      <div className="posts-list">
        {posts.map(post => (
          <Post key={post.PostID} post={post} />
        ))}
      </div>
    </div>
  );
}