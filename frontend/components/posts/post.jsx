"use client"

import React from 'react';
import { RiGlobalLine, RiGitRepositoryPrivateFill } from "react-icons/ri";
import { IoIosPeople } from "react-icons/io";


import './posts.css';

const Post = ({ post }) => {

  return (
    <div className="post">
      <div className="post-header">
        <img src={post.user.avatar} alt={`${post.author}'s avatar`} className="avatar" />
        <div className="post-meta">
          <span className="author">{post.user.name}</span>
          <div className='post-meta2'>
            {post.privacy && (
              <>
                {post.privacy === 'public' && <RiGlobalLine className='icon' />}
                {post.privacy === 'friends' && <IoIosPeople className='icon' />}
                {post.privacy === 'private' && <RiGitRepositoryPrivateFill className='icon' />}
              </>
            )}
            <span className="time">{post.timestamp}</span>
          </div>
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