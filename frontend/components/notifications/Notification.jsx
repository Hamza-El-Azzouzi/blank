'use client';
import { GetCookie } from "@/lib/cookie";
import { useEffect, useState } from "react";
import { MdDone, MdClose } from "react-icons/md";


export default function Notifications({ notif }) {
    const cookieValue = GetCookie("sessionId");
    const [allowActions, setAllowActions] = useState(notif?.allow_action);

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
            let data = await res.json();
            if (data.message !== "") {
                console.log(data.message)
            }

        } catch (err) {
            console.error("Error fetching notifications:", err);
        }
    }

    const handleAccept = async (e) => {
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
            } else {
                console.log(data.message)
            }

        } catch (err) {
            console.error("Error fetching:", err);
        }
    }
    const handleRefuse = async (e) => {
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
            } else {
                console.log(data.message)
            }

        } catch (err) {
            console.error("Error fetching:", err);
        }
    }

    switch (notif.type) {
        case "follow_request":
            notif.label = <p>New follow request from <strong>{notif.user_name}</strong></p>
            break;
        case "group_invitation":
            notif.label = <p>You've been invited to join <strong>{notif.group_title}</strong></p>
            break;
        case "join_request":
            notif.label = <p><strong>{notif.user_name}</strong> requested to join <strong>{notif.group_title}</strong></p>
            break;
        case "event":
            notif.label = <p>New event created by <strong>{notif.user_name}</strong> in <strong>{notif.group_title}</strong></p>
            break;
    }

    return (

        <div className={`notification-item ${notif.seen ? 'seen' : ''}`} >
            <div className="notification-info">
                {notif.label}
                <span className="notification-date">{notif.formatted_date}</span>
            </div>
            {allowActions &&
                <div className="notification-action">
                    <button className="refuse" onClick={handleRefuse}><MdClose className="icon" /> Refuse</button>
                    <button className="accept" onClick={handleAccept}><MdDone className="icon" /> Accept</button>
                </div>}
        </div>
    )
}