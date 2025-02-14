"use client"
// components/posts/createPost.jsx
import React, { useState } from 'react';
import { FiImage, FiGlobe, FiChevronDown } from 'react-icons/fi';
import './posts.css';

const CreatePost = () => {
    const [content, setContent] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const [privacy, setPrivacy] = useState('Public');
    const [showPrivacyDropdown, setShowPrivacyDropdown] = useState(false);

    const privacyOptions = ['Public', 'Friends', 'specific friends'];

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
        // Handle post submission
        console.log({ content, privacy, imagePreview });
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
                            ×
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

                        <div className="privacy-selector">
                            <button type="button" className="privacy-button"
                                onClick={() => setShowPrivacyDropdown(!showPrivacyDropdown)} >
                                <FiGlobe className="privacy-icon" />
                                {privacy}
                                <FiChevronDown className="dropdown-icon" />
                            </button>

                            {showPrivacyDropdown && (
                                <div className="privacy-dropdown">
                                    {privacyOptions.map((option) => (
                                        <button key={option} type="button" className="privacy-option"
                                            onClick={() => { setPrivacy(option); setShowPrivacyDropdown(false) }}>
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
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