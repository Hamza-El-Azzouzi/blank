// components/groups/createPost.jsx
"use client"
import React, { useState } from 'react';
import { FiImage, FiX } from 'react-icons/fi';
import '../../posts/posts.css';

const CreatePost = () => {
    const [content, setContent] = useState('');
    const [imagePreview, setImagePreview] = useState(null);

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

    const handleSubmit = (e) => {
        e.preventDefault();
    };

    const removeImage = () => {
        setImagePreview(null);
    };

    return (
        <div className="create-post-container">
            <form onSubmit={handleSubmit}>
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

                    <button type="submit" className="post-submit-button"
                        disabled={!content.trim() && !imagePreview}>
                        Post
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreatePost;