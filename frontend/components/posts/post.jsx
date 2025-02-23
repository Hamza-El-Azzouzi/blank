// components/posts/post.jsx
"use client"
import React, { useState } from 'react';
import { FiHeart, FiMessageSquare, FiSend } from 'react-icons/fi';
import * as cookies from '@/lib/cookie';
import './posts.css';

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

const Post = ({ post, target}) => {
  console.log(target)
  const [isLiked, setIsLiked] = useState(post.has_liked);
  const [likesCount, setLikesCount] = useState(post.like_count);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(mockComments);
  const [newComment, setNewComment] = useState('');

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

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment = {
      id: comments.length + 1,
      author: "Current User",
      avatar: AVATAR,
      content: newComment,
      time: "Just now"
    };

    setComments(prev => [comment, ...prev]);
    setNewComment('');
  };
  return (
    <div className="post">
      <div className="post-header">
        <img src={post.avatar} alt={`${post.author}'s avatar`} className="post-avatar" />
        <div className="post-meta">
          <span className="post-author">{post.author}</span>
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
          {post.comment_count} comments
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

      {showComments && (
        <div className="comments-section">
          <form onSubmit={handleSubmitComment} className="comment-form">
            <img src="/default-avatar.jpg" alt="Your avatar" className="comment-avatar" />
            <div className="comment-input-container">
              <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..." className="comment-input" />
              <button type="submit" className="send-comment-button">
                <FiSend />
              </button>
            </div>
          </form>

          <div className="comments-list">
            {comments.map(comment => (
              <div key={comment.id} className="comment">
                <img src="/default-avatar.jpg" alt={`${comment.author}'s avatar`} className="comment-avatar" />
                <div className="comment-content">
                  <div className="comment-author">{comment.author}</div>
                  <p className="comment-text">{comment.content}</p>
                  <span className="comment-time">{comment.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Post;