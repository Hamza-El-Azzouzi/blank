"use client"

import React from 'react';
import './posts.css';

const Post = ({ post }) => {
  return (
    <div className="post">
      <div className="post-header">
        <img src={post.avatar} alt={`${post.author}'s avatar`} className="avatar" />
        <div className="post-meta">
          <span className="author">{post.author}</span>
          <span className="time">{post.time}</span>
        </div>
      </div>

      <div className="post-content">
        {post.content}
      </div>

      <div className="post-actions">
        <button className="action-button">
          <span>👍 {post.likes}</span>
        </button>
        <button className="action-button">
          <span>💬 {post.comments}</span>
        </button>
      </div>
    </div>
  );
};

export default Post;