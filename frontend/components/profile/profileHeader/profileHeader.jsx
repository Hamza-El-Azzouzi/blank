"use client"
import React, { useState } from 'react';
import './profileHeader.css';
import UpdateInfoDialog from '../UpdateInfoDialog';
import { FaUserEdit } from "react-icons/fa";

const ProfileHeader = ({ profile, setProfile, cookieValue }) => {

    const [updateInfo, setUpdateInfo] = useState(false);

    return (
        <div className="profile-header">
            <div className="avatar">
                <img
                    src={profile.avatar}
                    alt={`${profile.first_name} ${profile.last_name}`}
                />
            </div>
            <div className="profile-info">
                <h1>{profile.first_name} {profile.last_name}</h1>
                <div className="profile-meta">
                    <span className="profile-stat">
                        {profile.followers || 0} Followers
                    </span>
                    <span className="profile-stat">
                        {profile.following || 0} Following
                    </span>

                </div>
            </div>
            {profile.is_owner ? (
                <button
                    className="update-info-btn"
                    onClick={() => setUpdateInfo(true)}
                >
                    <FaUserEdit />
                </button>
            ) : (
                <></> // here will be follow button
            )}

            {updateInfo && (
                <UpdateInfoDialog
                    user={profile}
                    onClose={() => setUpdateInfo(false)}
                    setProfile={setProfile}
                    cookieValue={cookieValue}
                />
            )}
        </div>
    );
};

export default ProfileHeader;