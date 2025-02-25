// components/groups/createPost.jsx
"use client"
import React, { useState } from 'react';
import { FiImage, FiX } from 'react-icons/fi';
import '../../posts/posts.css';
// import { useParams } from 'next/navigation';
import { GetCookie } from '@/lib/cookie';
import { fetchBlob } from '@/lib/fetch_blob';

const CreatePost = ({groupID, onPostCreated }) => {
    const [error,setError] = useState("")
    const [content, setContent] = useState('');
    const [imagePreview, setImagePreview] = useState('');

    const cookieValue = GetCookie("sessionId")
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };
    const handlePost = async () => {
        setError("")
        const postData = {
            "groupId" : groupID ,
            content,
            "image": imagePreview,
        };
        if (!content.trim() && !imagePreview) {
            setError('Post must contain either text or an image');
            return;
        }

        if (content.length > 400) {
            setError('Content exceeds maximum length of 400 characters');
            return;
        }

        if (imagePreview && imagePreview.length > 1*1024*1024) {
            setError('Image size is too large');
            return;
        }
      
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/group/create/post`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${cookieValue}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(postData)
            });

            if (!response.ok) {
                throw new Error('Failed to create post');
            }

            const post = await response.json();
            const newPost = {
                post_id: post.data.post_id,
                author: `${post.data.first_name} ${post.data.last_name}`,
                avatar: post.data.avatar ? await fetchBlob(process.env.NEXT_PUBLIC_BACK_END_DOMAIN + post.data.avatar) : '/default-avatar.jpg',
                content: post.data.content,
                image: post.data.image ? await fetchBlob(process.env.NEXT_PUBLIC_BACK_END_DOMAIN + post.data.image) : null,
                formatted_date: post.data.formatted_date,
                like_count: post.data.like_count,
                comment_count: post.data.comment_count,
                isLiked: post.data.HasLiked,
            };
            
            if (onPostCreated) onPostCreated(newPost);

            setContent('');
            setImagePreview(null);
        } catch (error) {
            console.error('Error creating post:', error);
        }
    };

    const removeImage = () => {
        setImagePreview(null);
    };

    return (
        <div className="create-post-container">
            <form>
                <textarea placeholder="What's on your mind?" value={content}
                    onChange={(e) => setContent(e.target.value)} className="post-textarea"
                    maxLength={400} />

                {imagePreview && (
                    <div className="image-preview-wrapper">
                        <img src={imagePreview} alt="Preview" className="preview-image" />
                        <button type="button" onClick={removeImage} className="remove-image" aria-label="Remove image">
                            <FiX />
                        </button>
                    </div>
                )}

                <div className="create-post-footer">
                    <div className="create-post-actions">
                        <label className="upload-image-label">
                            <FiImage className="action-icon" />
                            <input type="file" accept="image/*"
                                onChange={handleImageChange} className="hidden-input" />
                        </label>
                    </div>

                    <button type="Button" className="post-submit-button"
                        onClick={handlePost}
                        disabled={!content.trim() && !imagePreview}>
                        Post
                    </button>
                </div>
                {error && <div className="error-message">*{error}</div>}
            </form>
        </div>
    );
};

export default CreatePost;