'use client';
import { GetCookie } from "@/lib/cookie";
import { useEffect, useState } from "react";
import { MdDone, MdClose, MdGroupAdd, MdNotificationAdd } from "react-icons/md";
import { BsFillCalendarEventFill } from "react-icons/bs";
import { HiViewGridAdd } from "react-icons/hi";
import { IoPersonAdd } from "react-icons/io5";


export default function Notification({ notif }) {
    const cookieValue = GetCookie("sessionId");
    const [allowActions, setAllowActions] = useState(notif.allow_action || false);

    useEffect(() => {
        if (notif.seen) return
        markNotifAsSeen()
    }, []);

    const markNotifAsSeen = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/notifications/${notif.id}/see`, {
                credentials: "include",
                method: "PUT",
                headers: { Authorization: `Bearer ${cookieValue}` },
            });

        } catch (err) {
            console.error("Error fetching notifications:", err);
        }
    }

    const handleAcceptFollow = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/acceptfollow`, {
                credentials: "include",
                method: "PUT",
                headers: { Authorization: `Bearer ${cookieValue}` },
                body: JSON.stringify({
                    follower_id: notif.user_id,
                }),
            });
            let data = await res.json();
            if (data.message == "success") {
                setAllowActions(false)
                notif.seen = true
            }

        } catch (err) {
            console.error("Error fetching:", err);
        }
    }
    const handleRefuseFollow = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/refusefollow`, {
                credentials: "include",
                method: "DELETE",
                headers: { Authorization: `Bearer ${cookieValue}` },
                body: JSON.stringify({
                    follower_id: notif.user_id,
                }),
            });
            let data = await res.json();
            if (data.message == "success") {
                setAllowActions(false)
                notif.seen = true
            }
        } catch (err) {
            console.error("Error fetching:", err);
        }
    }

    const handleAcceptGroupInvitation = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/join/${notif.group_id}/accept-invite`, {
                credentials: "include",
                method: "PUT",
                headers: { Authorization: `Bearer ${cookieValue}` },
            });
            let data = await res.json();
            if (data.message == "success") {
                setAllowActions(false)
                notif.seen = true
            }

        } catch (err) {
            console.error("Error fetching:", err);
        }
    }

    const handleRefuseGroupInvitation = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/join/${notif.group_id}/refuse-invite`, {
                credentials: "include",
                method: "DELETE",
                headers: { Authorization: `Bearer ${cookieValue}` },
            });
            let data = await res.json();
            if (data.message == "success") {
                setAllowActions(false)
                notif.seen = true
            }

        } catch (err) {
            console.error("Error fetching:", err);
        }
    }

    switch (notif.type) {
        case "follow_request":
            notif.icon = <IoPersonAdd className="notif-icon" />
            notif.label = <span className="notif-label">{notif.icon} New follow request from <strong>{notif.user_name}</strong></span>
            break;
        case "follow":
            notif.icon = <IoPersonAdd className="notif-icon" />
            notif.label = <span className="notif-label">{notif.icon} New follow from <strong>{notif.user_name}</strong></span>
            break;
        case "group_invitation":
            notif.icon = <MdGroupAdd className="notif-icon" />
            notif.label = <span className="notif-label">{notif.icon} You've been invited to join <strong>{notif.group_title}</strong></span>
            break;
        case "join_request":
            notif.icon = <HiViewGridAdd className="notif-icon" />
            notif.label = <span className="notif-label">{notif.icon}<strong>{notif.user_name}</strong> requested to join <strong>{notif.group_title}</strong></span>
            break;
        case "event":
            notif.icon = <BsFillCalendarEventFill className="notif-icon" />
            notif.label = <span className="notif-label">{notif.icon} An event created by <strong>{notif.user_name}</strong> in <strong>{notif.group_title}</strong></span>
            break;
        default:
            notif.icon = <MdNotificationAdd className="notif-icon" />
            notif.label = <span className="notif-label">{notif.icon} New notification from <strong>{notif.group_title || notif.user_name}</strong></span>
    }

    return (

        <div className={`notification-item ${notif.seen ? 'seen' : ''}`} >
            <div className="notification-info">
                {notif.label}
                <span className="notification-date">{notif.formatted_date}</span>
            </div>
            {allowActions && (
                (notif.type === "follow_request" && (
                    <div className="notification-action">
                        <button className="refuse" onClick={handleRefuseFollow}><MdClose className="icon" /> Refuse</button>
                        <button className="accept" onClick={handleAcceptFollow}><MdDone className="icon" /> Accept</button>
                    </div>
                )) ||
                (notif.type === "group_invitation" && (
                    <div className="notification-action">
                        <button className="refuse" onClick={handleRefuseGroupInvitation}><MdClose className="icon" /> Refuse</button>
                        <button className="accept" onClick={handleAcceptGroupInvitation}><MdDone className="icon" /> Accept</button>
                    </div>
                ))
            )}
        </div>
    )
}