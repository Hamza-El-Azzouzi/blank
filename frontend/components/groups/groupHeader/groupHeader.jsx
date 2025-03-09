"use client"
import React, { useState } from 'react';
import { FiUsers, FiCalendar, FiUser, FiPlus, FiTrash2 } from 'react-icons/fi';
import './groupHeader.css';
import { GetCookie } from '@/lib/cookie';
import Toast from '@/components/toast/Toast';
import { useParams, useRouter } from 'next/navigation';
import InviteDialog from '../inviteDialog/inviteDialog';

const GroupHeader = ({ group, onJoinStateChange }) => {
    const { groupID } = useParams();
    const router = useRouter()
    const cookieValue = GetCookie("sessionId")
    const [toasts, setToasts] = useState([]);
    const [isDisabled, setIsDisabled] = useState(group.IsPending || group.IsJoined || group.IsOwner);
    const [showInviteDialog, setShowInviteDialog] = useState(false);
    const [isPendingHovered, setIsPendingHovered] = useState(false);

    const handleLeaveGroup = (e) => {
        e.preventDefault()
        fetch(`${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/group/${groupID}/leave`, {
            method: "POST",
            credentials: "include",
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${cookieValue}`
            },
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(error => { throw error; });
                }
                return response.json();
            })
            .then(() => {
                showToast('success', 'Success! Operation completed.');
                onJoinStateChange(false)
            }).catch((error) => {
                showToast('error', "An Error Occure, Try Later!!");
            })
    };

    const handleCancelRequest = (e) => {
        e.preventDefault()
        fetch(`${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/group/${groupID}/cancel`, {
            method: "POST",
            credentials: "include",
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${cookieValue}`
            },
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(error => { throw error; });
                }
                return response.json();
            })
            .then(() => {
                showToast('success', 'Request cancelled successfully.');
                onJoinStateChange(false);
            }).catch((error) => {
                showToast('error', "An Error Occure, Try Later!!");
            })
    };

    const showToast = (type, message) => {
        const newToast = { id: Date.now(), type, message };
        setToasts((prevToasts) => [...prevToasts, newToast]);
    };

    const removeToast = (id) => {
        setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    };

    const handleJoinGroup = (e) => {
        e.preventDefault()
        fetch(`${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/join/${groupID}/requested`, {
            method: "POST",
            credentials: "include",
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${cookieValue}`
            },
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(error => { throw error; });
                }
                return response.json();
            })
            .then(() => {
                showToast('success', 'Success! Operation completed.');
                setIsDisabled(true);
                group.IsPending = true
                onJoinStateChange(false);
            }).catch((error) => {
                showToast('error', "An Error Occure, Try Later!!");
            })
    };

    const handleDestoryCommunity = (e) => {
        e.preventDefault()
        fetch(`${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/group/${groupID}/delete`, {
            method: "DELETE",
            credentials: "include",
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${cookieValue}`
            },
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(error => { throw error; });
                }
                return response.json();
            })
            .then(() => {
                showToast('success', 'Success! Operation completed.');
                router.push("/groups")
            }).catch((error) => {
                showToast('error', "An Error Occure, Try Later!!");
            })
    };

    const handleAcceptGroupInvitation = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/join/${group.GroupeId}/accept-invite`, {
                credentials: "include",
                method: "PUT",
                headers: { Authorization: `Bearer ${cookieValue}` },
            });
            let data = await res.json();
            if (data.status !== 200) {
                throw new Error("An Error Occure, Try Later!!")
            }
            showToast('success', 'Success! Operation completed.')
            onJoinStateChange(true)
            group.IsInvited = false
            group.Member_count += 1
        } catch (err) {
            showToast('error', "An Error Occure, Try Later!!");
        }
    }

    const handleRefuseGroupInvitation = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/join/${group.GroupeId}/refuse-invite`, {
                credentials: "include",
                method: "DELETE",
                headers: { Authorization: `Bearer ${cookieValue}` },
            });
            let data = await res.json();
            if (data.status !== 200) {
                throw new Error("An Error Occure, Try Later!!")
            }
            showToast('success', 'Success! Operation completed.')
            onJoinStateChange(false)
        } catch (err) {
            showToast('error', "An Error Occure, Try Later!!");
        }
    }

    return (
        <>
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
            <div className="gh-container">
                <div className="gh-info-section">
                    <h1 className="gh-title">{group.Name}</h1>
                    <p className="gh-description">{group.Description}</p>
                    <div className="gh-metadata">
                        <span className="gh-stat-item">
                            <FiUsers /> {group.Member_count} members
                        </span>
                        <span className="gh-stat-item">
                            <FiCalendar /> Created: {group.FormatedDate}
                        </span>
                        <span className="gh-stat-item">
                            <FiUser /> Creator: {group.Last_Name} {group.First_Name}
                        </span>
                    </div>
                </div>
                <div className="gh-actions-container">
                    {group.IsOwner ? (
                        <>
                            <button
                                className="gh-button gh-destroy-btn"
                                onClick={(e) => { handleDestoryCommunity(e) }}
                            >
                                <FiTrash2 /> Destroy Community
                            </button>
                            <button
                                className="gh-button gh-invite-btn"
                                onClick={() => setShowInviteDialog(true)}
                            >
                                <FiPlus /> Invite Members
                            </button>
                        </>
                    ) : group.IsJoined ? (
                        <>
                            <button
                                className="gh-button gh-leave-btn"
                                onClick={(e) => { handleLeaveGroup(e) }}
                            >
                                Leave Group
                            </button>
                            <button
                                className="gh-button gh-invite-btn"
                                onClick={() => setShowInviteDialog(true)}
                            >
                                <FiPlus /> Invite Members
                            </button>
                        </>
                    ) : group.IsPending ? (
                        <button
                            className={`gh-button gh-join-btn pending`}
                            onClick={(e) => handleCancelRequest(e)}
                            onMouseEnter={() => setIsPendingHovered(true)}
                            onMouseLeave={() => setIsPendingHovered(false)}
                        >
                            {isPendingHovered ? 'Cancel Request' : 'Pending'}
                        </button>
                    ) : group.IsInvited ? (
                        <>
                            <button className="gh-button gh-accept-btn" onClick={handleAcceptGroupInvitation}>Accept</button>
                            <button className="gh-button gh-leave-btn" onClick={handleRefuseGroupInvitation}>Refuse</button>
                        </>
                    ) : (
                        <button
                            className="gh-button gh-join-btn"
                            disabled={isDisabled}
                            onClick={(e) => { handleJoinGroup(e) }}
                        >
                            Join Group
                        </button>
                    )}
                </div>
            </div>
            {showInviteDialog && (
                <InviteDialog
                    onClose={() => setShowInviteDialog(false)}
                    cookieValue={cookieValue}
                    groupID={groupID}
                />
            )}
        </>
    );
};

export default GroupHeader;