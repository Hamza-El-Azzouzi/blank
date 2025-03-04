"use client";
import React, { useState, useEffect } from "react";
import "./notifications.css";
import { BiLoaderCircle } from "react-icons/bi";
import { GetCookie } from "@/lib/cookie";
import Loading from "@/components/loading/Loading";
import Notifications from "@/components/notifications/Notification";
import Link from "next/link";

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [noMore, setNoMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    const cookieValue = GetCookie("sessionId");

    useEffect(() => {
        if (!cookieValue || noMore) return;
        if (page > 0) setLoadingMore(true);
        fetchNotifications();
    }, [page, cookieValue]);

    useEffect(() => {
        const container = document.getElementById("main-content");
        if (!container) return;
        container.addEventListener("scroll", handleScroll);
        return () => container.removeEventListener("scroll", handleScroll);
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/notifications/${page}`, {
                credentials: "include",
                headers: { Authorization: `Bearer ${cookieValue}` },
            });
            let data = await res.json();
            data = data.data;

            if (Array.isArray(data) && data.length > 0) {
                if (data.length < 20) setNoMore(true);
                setNotifications((prevNotifs) => {
                    const exist = new Set(prevNotifs.map((c) => c.id));
                    const newNotifs = data.filter((c) => !exist.has(c.id));
                    return [...prevNotifs, ...newNotifs];
                });
            }
        } catch (err) {
            console.error("Error fetching notifications:", err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleScroll = () => {
        const container = document.getElementById("main-content");
        if (!container) return;
        if (Math.ceil(container.scrollTop + container.clientHeight) >= container.scrollHeight - 1) {
            setPage((prevPage) => prevPage + 1);
        }
    };

    return (
        <div className="notifications" id="notifications">
            <h2>Notifications</h2>
            {loading && page === 0 ? (
                <Loading />
            ) : notifications.length > 0 ? (
                notifications.map((notif) => (
                    <Link key={notif.id} className="link" href={
                        notif.type === "follow_request"
                            ? "/profile/" + notif.user_id
                            : "/groups/" + notif.group_id
                    }>
                        <Notifications notif={notif} />
                    </Link>
                ))
            ) : (
                <span className="no-notifications">No notifications to display!</span>
            )}
            {!noMore && loadingMore && (
                <span className="notifications-loading-more">
                    <BiLoaderCircle className="loader" />
                </span>
            )}
        </div >
    );
};

export default NotificationsPage;