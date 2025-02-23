// app/(main)/page.js
'use client'
import CreatePost from '@/components/posts/createPost';
import Posts from '@/components/posts/posts';
import { useState, useEffect } from 'react';
import * as cookies from '@/lib/cookie';
import { fetchBlob } from '@/lib/fetch_blob';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [endReached, setEndReached] = useState(false);

  const fetchPosts = async (pageNumber) => {
    if (endReached) return;
    
    const sessionId = cookies.GetCookie("sessionId");
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/posts/${pageNumber}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sessionId}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch posts');
      const data = await response.json();
      const posts = data.data;
      if (posts && posts.length > 0) {
        const newPosts = await Promise.all(posts.map(async (post) => {
          post.avatar = post.avatar
            ? await fetchBlob(process.env.NEXT_PUBLIC_BACK_END_DOMAIN + post.avatar)
            : '/default-avatar.jpg';
          if (post.image) {
            post.image = await fetchBlob(process.env.NEXT_PUBLIC_BACK_END_DOMAIN + post.image);
          }
          return post;
        }));
        
        if (pageNumber === 0) {
          setPosts(newPosts);
        } else {
          setPosts(prevPosts => {
            const seen = new Set(prevPosts.map(p => p.post_id));
            const filteredNewPosts = newPosts.filter(post => !seen.has(post.post_id));
            return [...prevPosts, ...filteredNewPosts];
          });
        }
        setHasMore(newPosts.length === 20);
      } else {
        setHasMore(false);
        setEndReached(true);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(page);
  }, [page]);

  const handleNewPost = (newPost) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      setPage(prevPage => prevPage + 20);
    }
  };

  return (
    <div className="feed-container">
      <CreatePost onPostCreated={handleNewPost} />
      <Posts 
        posts={posts} 
        loading={loading} 
        endReached={endReached} 
        onLoadMore={handleLoadMore} 
      />
    </div>
  );
}