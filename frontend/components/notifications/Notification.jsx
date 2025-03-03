'use client';
import { GetCookie } from "@/lib/cookie";
import { useEffect } from "react";
import { MdDone, MdClose } from "react-icons/md";


export default function Notifications({ notif }) {
    const cookieValue = GetCookie("sessionId");

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
        console.log("handleAccept");

    }
    const handleRefuse = async (e) => {
        e.preventDefault();
        console.log("handleAccept");
    }

    switch (notif.type) {
        case "follow_request":
            notif.label = <p>New follow request from {notif.user_name}</p>
            break;
        case "group_invitation":
            notif.label = <p>You've been invited to join {notif.group_title}</p>
            break;
        case "join_request":
            notif.label = <p>{notif.user_name} requested to join  {notif.group_title}</p>
            break;
        case "event":
            notif.label = <p>New event created by {notif.user_name} in {notif.group_title}</p>
            break;
    }

    return (

        <div className={`notification-item ${notif.seen ? 'seen' : ''}`} >
            <div className="notification-info">
                {notif.label}
                <span className="notification-date">{notif.formatted_date}</span>
            </div>
            <div className="notification-action">
                <button className="refuse" onClick={handleRefuse}><MdClose className="icon" /> Refuse</button>
                <button className="accept" onClick={handleAccept}><MdDone className="icon" /> Accept</button>
            </div>
        </div>
    )
}