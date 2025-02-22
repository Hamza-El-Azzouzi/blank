"use client"
import React, { useState, useEffect } from 'react';
import './profileHeader.css';
import UpdateInfoDialog from '../UpdateInfoDialog';
import { FaUserEdit } from "react-icons/fa";
import FollowDialog from '../followDialog/followDialog';

const ProfileHeader = ({ profile, setProfile, cookieValue, userID }) => {
    const [updateInfo, setUpdateInfo] = useState(false);
    const [followStatus, setFollowStatus] = useState("");
    const [showFollowDialog, setShowFollowDialog] = useState(false);
    const [dialogType, setDialogType] = useState(null);

    const handleOpenDialog = (type) => {
        setDialogType(type);
        setShowFollowDialog(true);
    };

    useEffect(() => {
        setFollowStatus(profile.follow_status);
    }, [profile.follow_status]);

    const handleFollow = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/requestfollow`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${cookieValue}`
                },
                body: JSON.stringify({ following_id: userID })
            });

            if (response.ok) {
                const res = await response.json();
                setFollowStatus(res.data.follow_status);
                setProfile(prev => ({
                    ...prev,
                    followers: prev.followers + (res.data.follow_status === "Following" ? 1 : 0),
                    follow_status: res.data.follow_status
                }));
            }
        } catch (error) {
            console.error('Failed to follow/unfollow:', error);
        }
    };

    const handleDeleteFollow = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/deletefollowing`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${cookieValue}`
                },
                body: JSON.stringify({ following_id: userID })
            });

            if (response.ok) {
                setFollowStatus("Follow");
                setProfile(prev => ({
                    ...prev,
                    followers: prev.followers - (prev.follow_status === "Following" ? 1 : 0),
                    follow_status: "Follow"
                }));
            }
        } catch (error) {
            console.error('Failed to delete/cancel follow:', error);
        }
    };

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
                    <span className="profile-stat" onClick={() => handleOpenDialog('followers')}>
                        {profile.followers} Followers
                    </span>
                    <span className="profile-stat" onClick={() => handleOpenDialog('Following')}>
                        {profile.following} Following
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
                <button
                    className="follow-btn"
                    onClick={followStatus === "Follow" ? handleFollow : handleDeleteFollow}
                >
                    {followStatus === "Following" ? "Unfollow" : followStatus === "Pending" ? "Cancel Request" : "Follow"}
                </button>
            )}

            {showFollowDialog && profile.is_owner && (
                <FollowDialog
                    type={dialogType}
                    onClose={() => setShowFollowDialog(false)}
                    cookieValue={cookieValue}
                    setProfile={setProfile}
                />
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