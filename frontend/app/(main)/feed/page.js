"use client"
import React, { useState } from 'react';
import CreatePost from '@/components/posts/createPost';
import Post from '@/components/posts/post';

const FeedPage = () => {
    const [posts, setPosts] = useState([]); // Store posts in state

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
};

export default FeedPage;
