"use client"
import React, { useState,useRef } from 'react';
import { FiX, FiImage, FiGlobe } from 'react-icons/fi';
import './createGroup.css';
const CreateGroup = ({ onClose, onSubmit }) => {
    const [error, setError] = useState("");
    const nameRef = useRef();
    const descriptionRef = useRef();

    const validateForm = (name, description) => {
        if (!name.trim() || !description.trim()) {
            setError('Please fill in all required fields');
            return false;
        }

        const nameRegex = /^[a-zA-Z0-9\s]+$/;
        if (!nameRegex.test(name)) {
            setError('Group name can only contain letters, numbers and spaces');
            return false;
        }

        if (name.length > 50) {
            setError('Group name must be less than 50 characters');
            return false;
        }

        if (description.length > 250) {
            setError('Description must be less than 150 characters');
            return false;
        }

        return true;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const name = nameRef.current.value;
        const description = descriptionRef.current.value;

        if (validateForm(name, description)) {
            onSubmit({ name, description });
            onClose();
        }
    };

    return (
        <div className="create-group-overlay">
            <div className="create-group-modal">
                <div className="create-group-header">
                    <h2>Create New Group</h2>
                    <button onClick={onClose} className="close-button">
                        <FiX />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="create-group-form">
                    <div className="form-group">
                        <input 
                            ref={nameRef}
                            type="text" 
                            name="name" 
                            placeholder="Group Name"
                            className="group-input" 
                            onChange={() => setError("")}
                            required 
                        />
                    </div>

                    <div className="form-group">
                        <textarea 
                            ref={descriptionRef}
                            name="description" 
                            placeholder="Group Description"
                            maxLength={150} 
                            className="group-textarea"
                            onChange={() => setError("")}
                            required 
                        />
                    </div>
                    {error && <div className="error-message">*{error}</div>}
                    <div className="form-footer">
                        <button type="button" onClick={onClose} className="cancel-button">
                            Cancel
                        </button>
                        <button type="submit" className="submit-button">
                            Create Group
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateGroup;