// app/(main)/page.js
'use client'
import CreatePost from '@/components/posts/createPost';
import Post from '@/components/posts/post';
import { useState, useEffect, useRef, useCallback } from 'react';
import * as cookies from '@/lib/cookie';
import { fetchBlob } from '@/lib/fetch_blob';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [endReached, setEndReached] = useState(false);
  const observer = useRef();
  
  const lastPostElementRef = useCallback(node => {
    if (loading || endReached) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        setPage(prevPage => prevPage + 20);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, endReached]);

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
      if (data && data.length > 0) {
        const newPosts = await Promise.all(data.map(async (post) => {
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
          setPosts(prevPosts => [...prevPosts, ...newPosts]);
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

  return (
    <div className="feed-container">
      <CreatePost onPostCreated={handleNewPost} />
      <div className="posts-list">
        {posts.map((post, index) => {
          if (posts.length === index + 1 && !endReached) {
            return <div ref={lastPostElementRef} key={`${post.post_id}`}>
              <Post post={post} />
            </div>
          } else {
            return <Post key={`${post.post_id}`} post={post} />;
          }
        })}
        {loading && (
          <div className="loading-spinner"></div>
        )}
        {endReached && posts.length > 0 && (
          <div className="end-message">No more posts to load</div>
        )}
      </div>
    </div>
  );
}