// components/posts/post.jsx
"use client"
import React, { useState } from 'react';
import Link from 'next/link';
import { FiHeart, FiMessageSquare, FiGlobe, FiUsers, FiLock } from 'react-icons/fi';
import * as cookies from '@/lib/cookie';
import './posts.css';
import Comments from '../comments/Comments';

const Post = ({ post, target}) => {
  const [isLiked, setIsLiked] = useState(post.has_liked);
  const [likesCount, setLikesCount] = useState(post.like_count);
  const [commentsCount, setCommentsCount] = useState(post.comment_count || 0);
  const [showComments, setShowComments] = useState(false);

  const handleLike = async () => {
    const sessionId = cookies.GetCookie("sessionId");
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/reacts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionId}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetId: post.post_id,
          targetType: target  
        })
      });

      if (!response.ok) {
        throw new Error('Failed to like post');
      }

      const data = await response.json();
      setIsLiked(!isLiked);
      setLikesCount(data.like_count);

    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  return (
    <div className="post">
      <div className="post-header">
        <Link
          key={post.user_id}
          href={`/profile/${post.user_id}`}
        >
          <img src={post.avatar} alt={`${post.author}'s avatar`} className="post-avatar" />
        </Link>
        <div className="post-meta">
          <Link
            key={post.user_id}
            href={`/profile/${post.user_id}`}
          >
            <span className="post-author">{post.author}</span>
          </Link>
          <span className="post-time">
            <div style={{fontSize: '13px'}}>
              {post.privacy === 'public' && <FiGlobe className="privacy-icon" />}
              {post.privacy === 'almost private' && <FiUsers className="privacy-icon" />}
              {post.privacy === 'private' && <FiLock className="privacy-icon" />}
            </div>
            <div>{post.formatted_date}</div>
          </span>
        </div>
      </div>

      <div className="post-content">
        <p className="post-text">{post.content}</p>

        {post.image && (
          <div className="post-image-container">
            {post.image !== "" && (
              <img
                src={post.image}
                alt="Post content"
                className="post-image"
              />
            )}
          </div>
        )}
      </div>

      <div className="engagement-stats">
        <span className="likes-count">
          {likesCount} likes
        </span>
        <span className="comments-count">
          {commentsCount} comments
        </span>
      </div>

      <div className="post-actions">
        <button className={`action-button ${isLiked ? 'liked' : ''}`} onClick={handleLike}>
          <FiHeart className={`action-icon ${isLiked ? 'liked' : ''}`} />
          <span>Like</span>
        </button>

        <button className="action-button" onClick={() => setShowComments(!showComments)}>
          <FiMessageSquare className="action-icon" />
          <span>Comment</span>
        </button>
      </div>

      {showComments &&
      <Comments postID={post.post_id} setCommentsCount={setCommentsCount} onClose={() => setShowComments(false)} target={target} />
      }
    </div>
  );
};

export default Post;