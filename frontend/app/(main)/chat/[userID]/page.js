'use client'
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { FiSend } from 'react-icons/fi';
import { GetCookie } from '@/lib/cookie';
import { useParams } from 'next/navigation';
import { fetchBlob } from '@/lib/fetch_blob';
import { formatTime } from '@/lib/format_time';
import './chat.css';

export default function ChatPage() {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [contact, setContact] = useState(null);
    const containerRef = useRef(null);

    const cookieValue = GetCookie("sessionId");
    const params = useParams();
    const userId = params.userID;

    useEffect(() => {
        if (!userId) return;

        const fetchContact = async () => {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/user-info/${userId}`,
                    {
                        method: 'GET',
                        headers: { 'Authorization': `Bearer ${cookieValue}` },
                    }
                );

                if (!response.ok) throw new Error('Failed to fetch user');

                const data = await response.json();
                if (data) {
                    const userData = data.data;
                    userData.avatar = userData.avatar
                        ? await fetchBlob(process.env.NEXT_PUBLIC_BACK_END_DOMAIN + userData.avatar)
                        : '/default-avatar.jpg';
                    setContact(userData);
                }
            } catch (error) {
                console.error('Error fetching contact:', error);
            }
        };

        fetchContact();
        fetchMessages(0);
        markMessagesAsSeen();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    const fetchMessages = async (pageNum) => {
        try {
            pageNum === 0 ? setLoading(true) : setLoadingMore(true);

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/chat/${userId}?offset=${pageNum}`,
                {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${cookieValue}` },
                }
            );

            if (!response.ok) throw new Error('Failed to fetch messages');

            const data = await response.json();

            if (data.data && data.data.length > 0) {
                const reversedMessages = [...data.data].reverse();
                if (pageNum === 0) {
                    setMessages(reversedMessages);
                    setTimeout(() => {
                        containerRef.current.scrollTop = containerRef.current.scrollHeight;
                    }, 4);

                } else {
                    const container = containerRef.current;
                    const scrollHeight = container?.scrollHeight || 0;
                    const scrollTop = container?.scrollTop || 0;

                    setMessages(prevMessages => [...reversedMessages, ...prevMessages]);
                    setTimeout(() => {
                        if (container) {
                            const newScrollHeight = container.scrollHeight;
                            container.scrollTop = scrollTop + (newScrollHeight - scrollHeight);
                        }
                    }, 4);
                }

                setHasMore(data.data.length === 20)
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            pageNum === 0 ? setLoading(false) : setLoadingMore(false);
        }
    };

    const loadMoreMessages = () => {
        if (hasMore && !loadingMore) {
            const nextPage = page + 20;
            setPage(nextPage);
            fetchMessages(nextPage);
        }
    };

    const markMessagesAsSeen = async () => {
        try {
            await fetch(
                `${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/chat/markAsRead/${userId}`,
                {
                    method: 'PATCH',
                    headers: { 'Authorization': `Bearer ${cookieValue}` },
                }
            );
        } catch (error) {
            console.error('Error marking messages as seen:', error);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        setMessages(prev => [...prev, {
            receiver_id: userId,
            content: message,
            created_at: Date.now()
        }]);

        setMessage('');

        setTimeout(() => {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }, 5);
    };

    return (
        <div className="chat-page">
            <div className="chat-page-header">
                <div className="chat-page-contact-info">
                    {contact && (
                        <>
                            <Image
                                src={contact.avatar}
                                alt={`${contact.first_name} ${contact.last_name}`}
                                width={40}
                                height={40}
                                className="chat-page-avatar"
                            />
                            <h2>{contact.first_name} {contact.last_name}</h2>
                        </>
                    )}
                </div>
            </div>

            <div
                className="chat-page-messages"
                ref={containerRef}
                onScroll={(e) => {
                    if (e.currentTarget.scrollTop < 50 && hasMore && !loadingMore) {
                        loadMoreMessages();
                    }
                }}
            >
                {!loading && (
                    <>
                        {messages.length === 0 ? (
                            <div className="no-messages">
                                <p>No messages yet</p>
                                <p>Start a conversation with {contact.first_name}!</p>
                            </div>
                        ) : (
                            <>
                                {messages.map((msg, index) => (
                                    <div key={index} className={`message ${msg.receiver_id === userId ? 'sent' : 'received'}`}>
                                        <div className="message-content">{msg.content}</div>
                                        <div className="message-time">{formatTime(msg.created_at)}</div>
                                    </div>
                                ))}
                            </>
                        )}
                    </>
                )}
            </div>

            <form className="chat-page-input-form" onSubmit={sendMessage}>
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="chat-page-input"
                />
                <button
                    type="submit"
                    className="send-message-btn"
                    disabled={!message.trim()}
                >
                    <FiSend />
                </button>
            </form>
        </div>
    );
}