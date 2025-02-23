// components/groups/createGroup.jsx
"use client"
import React, { useState } from 'react';
import { FiX, FiImage, FiGlobe } from 'react-icons/fi';
import './createGroup.css';

const CreateGroup = ({ onClose, onSubmit }) => {
    const [error,setError] = useState("")
    const [groupData, setGroupData] = useState({
        name: '',
        description: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setGroupData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        setError("")
        
        if (!groupData.name.trim() || !groupData.description.trim()) {
            setError('Please fill in all required fields');
            return;
        }

        const nameRegex = /^[a-zA-Z0-9\s]+$/;
        if (!nameRegex.test(groupData.name)) {
            setError('Group name can only contain letters, numbers and spaces');
            return;
        }

        if (groupData.name.length > 50) {
            setError('Group name must be less than 50 characters');
            return;
        }

        if (groupData.description.length > 250) {
            setError('Description must be less than 150 characters');
            return;
        }
        e.preventDefault();
        onSubmit(groupData);
        onClose();
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
                        <input type="text" name="name" placeholder="Group Name" value={groupData.name}
                            onChange={handleChange} className="group-input" required />
                    </div>

                    <div className="form-group">
                        <textarea name="description" placeholder="Group Description"
                            value={groupData.description} onChange={handleChange} maxLength={150} className="group-textarea" required />
                    </div>
                    {error && <div className="error-message">*{error}</div>}
                    <div className="form-footer">
                        <button type="button" onClick={onClose} className="cancel-button">
                            Cancel
                        </button>
                        <button type="submit" className="submit-button" disabled={!groupData.name || !groupData.description}>
                            Create Group
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateGroup;