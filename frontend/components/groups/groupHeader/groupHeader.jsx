// components/groups/groupHeader.jsx
"use client"
import React, { useState } from 'react';
import { FiUsers } from 'react-icons/fi';
import './groupHeader.css';
import { GetCookie } from '@/lib/cookie';
import Toast from '@/components/toast/Toast';
import { useParams, useRouter } from 'next/navigation';



const GroupHeader = ({ group, onMembershipUpdate }) => {
    const { groupID } = useParams();
    const router = useRouter()
    const cookieValue = GetCookie("sessionId")
    const [toasts, setToasts] = useState([]);
    console.log("cookie", cookieValue)
    const handleMembershipClick = () => {
        onMembershipUpdate(!group.isJoined);
    };
    const showToast = (type, message) => {
        const newToast = { id: Date.now(), type, message };
        setToasts((prevToasts) => [...prevToasts, newToast]);
    };
    const removeToast = (id) => {
        setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    };
    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
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
                console.log(response)
                if (!response.ok) {
                    console.log(response)
                    return response.json().then(error => { throw error; });
                }
                return response.json();
            })
            .then((data) => {
                showToast('success', 'Success! Operation completed.');
                router.push("/groups")
                console.log(data.data)
            }).catch((error) => {
                console.log(error)
                showToast('error', error.message);
            })
    };
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
            <div className="group-header">
                <div className="group-info">
                    <h1>{group.Name}</h1>
                    <p className="group-description">{group.Description}</p>
                    <div className="group-meta">
                        <span className="group-stat">
                            <FiUsers /> {group.Member_count} members
                        </span>
                        <span className="group-stat">
                            Created: {group.FormatedDate}
                        </span>
                        <span className="group-stat">
                            Creator: {group.Last_Name} {group.First_Name}
                        </span>
                    </div>
                </div>
                {group.IsJoined ? (
                    <button
                        className="leave-group-btn"
                        onClick={handleMembershipClick}
                    >
                        Leave Group
                    </button>
                ) : group.IsOwner ? (
                    <button
                        className="leave-group-btn"
                        onClick={(e) => { handleDestoryCommunity(e) }}
                    >
                        Destroy the Community
                    </button>
                ) : group.Pendding ? (
                    <button
                        className="join-group-btn"
                        disabled
                    >
                        Join Group
                    </button>
                ) : (
                    <button
                        className="join-group-btn"
                        onClick={handleMembershipClick}
                    >
                        Pending
                    </button>
                )}
            </div>
        </>

    );
};

export default GroupHeader;