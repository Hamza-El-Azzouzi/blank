// components/posts/post.jsx
"use client"
import React, { useState } from 'react';
import Link from 'next/link';
import { FiHeart, FiMessageSquare, FiSend } from 'react-icons/fi';
import * as cookies from '@/lib/cookie';
import './posts.css';
import Comments from '../comments/Comments';

const AVATAR = "https://static.vecteezy.com/system/resources/thumbnails/005/544/718/small_2x/profile-icon-design-free-vector.jpg"
const mockComments = [
  {
    id: 1,
    author: "Alex Turner",
    content: "This is amazing! 👏",
    time: "15m ago"
  },
  {
    id: 2,
    author: "Sara Wilson",
    content: "Great progress! Keep it up",
    time: "1h ago"
  }
];

const Post = ({ post }) => {
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
          targetType: "post"
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
        <a href={`/profile/${post.user_id}`}>
        </a>
        <div className="post-meta">
          <Link
            key={post.user_id}
            href={`/profile/${post.user_id}`}
          >
            <span className="post-author">{post.author}</span>
          </Link>
          <span className="post-time">{post.formatted_date}</span>
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
        <Comments postID={post.post_id} setCommentsCount={setCommentsCount} onClose={() => setShowComments(false)} />
      }
    </div>
  );
};

export default Post;