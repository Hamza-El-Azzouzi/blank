"use client"
import React, { useState } from 'react';
import './profileHeader.css';
import UpdateInfoDialog from '../UpdateInfoDialog';

const ProfileHeader = ({ profile, setProfile }) => {

    const isOwner = true
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
                        {profile.followers} Followers
                    </span>
                    <span className="profile-stat">
                        {profile.following} Following
                    </span>

                </div>
            </div>
            {isOwner ? (
                <button
                    className="update-info-btn"
                    onClick={() => setUpdateInfo(true)}
                >
                    Update Info
                </button>
            ) : (
                <></> // here will be follow button
            )}

            {updateInfo && (
                <UpdateInfoDialog
                    user={profile}
                    onClose={() => setUpdateInfo(false)}
                    setProfile={setProfile}
                />
            )}
        </div>
    );
};

export default ProfileHeader;