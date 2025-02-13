"use client"

import React from 'react';
import { useState } from 'react';
import './posts.css';

const CreatePost = () => {
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

    const removeImage = () => {
        setImagePreview(null);
    };

    return (
        <div className="create-post">
            <div className="create-post-header">
                <img src="/api/placeholder/40/40" alt="User avatar" className="avatar" />
                <textarea placeholder="Add a new post..." className="post-input" rows="3" />
            </div>

            {/* Image Preview */}
            {imagePreview && (
                <div className="image-preview-container">
                    <img src={imagePreview} alt="Preview" className="image-preview" />
                    <button className="remove-image-button" onClick={removeImage} aria-label="Remove image">
                        ✕
                    </button>
                </div>
            )}

            <div className="create-post-actions">
                <button className="attachment-button">
                    <span className="attachment-icon">🖼️</span>
                    <span>Add Image</span>
                    <input type="file" accept="image/*" className="file-input" onChange={handleImageChange} />
                </button>
                <button className="post-button">Post</button>
            </div>
        </div>
    );
};

export default CreatePost;