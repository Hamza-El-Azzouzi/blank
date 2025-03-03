'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { FiSend } from 'react-icons/fi';
import { GetCookie } from '@/lib/cookie';
import { useParams } from 'next/navigation';
import { fetchBlob } from '@/lib/fetch_blob';
import { formatTime } from '@/lib/format_time';
import { useWebSocket } from '@/lib/useWebSocket';
import '../../[userID]/chat.css';
import './group-chat.css';

export default function GroupChatPage() {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [group, setGroup] = useState(null);
    const [myUserId, setMyUserId] = useState(null);
    const containerRef = useRef(null);
    const messageSeenTimeout = useRef(null);

    const cookieValue = GetCookie("sessionId");
    const params = useParams();
    const groupID = params.groupID;

    useEffect(() => {
        const fetchCurrentUserId = async () => {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/integrity`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: 'token', value: cookieValue })
                    }
                );

                if (!response.ok) throw new Error('Failed to fetch user ID');

                const data = await response.json();
                setMyUserId(data.data);
            } catch (error) {
                console.error('Error fetching current user ID:', error);
            }
        };

        fetchCurrentUserId();
    }, [cookieValue]);

    useEffect(() => {
        if (!groupID) return;

        const fetchGroupInfo = async () => {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/group/${groupID}`,
                    {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${cookieValue}`,
                            'Content-Type': 'application/json'
                        },
                    }
                );

                if (!response.ok) throw new Error('Failed to fetch group');

                const data = await response.json();
                if (data && data.data) {
                    setGroup(data.data);
                }
            } catch (error) {
                console.error('Error fetching group:', error);
            }
        };

        fetchGroupInfo();
        fetchMessages(0);
        markMessagesAsSeen();

        return () => {
            if (messageSeenTimeout.current) {
                clearTimeout(messageSeenTimeout.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [groupID]);

    const handleNewMessage = useCallback((message) => {
        if (message?.receiver_id !== groupID) return

        setMessages(prev => [...prev, {
            message_id: message.id,
            sender_id: message.sender_id,
            group_id: message.receiver_id,
            content: message.content,
            seen: false,
            created_at: message.created_at || new Date().toISOString(),
            sender_first_name: message.sender_first_name || "User",
            sender_last_name: message.sender_last_name || "",
            sender_avatar: message.sender_avatar || "/default-avatar.jpg"
        }]);

        setTimeout(() => {
            if (containerRef.current) {
                containerRef.current.scrollTop = containerRef.current.scrollHeight;
            }
        }, 5);

        if (messageSeenTimeout.current) {
            clearTimeout(messageSeenTimeout.current);
        }

        messageSeenTimeout.current = setTimeout(() => {
            markMessagesAsSeen();
        }, 500);
    }, []);

    const sendWebSocketMessage = useWebSocket(groupID, handleNewMessage, null);

    const fetchMessages = async (pageNum) => {
        try {
            pageNum === 0 ? setLoading(true) : setLoadingMore(true);

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/chat/group/${groupID}?offset=${pageNum}`,
                {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${cookieValue}` },
                }
            );

            if (!response.ok) throw new Error('Failed to fetch messages');

            const data = await response.json();

            if (data.data && data.data.length > 0) {
                const processedMessages = await Promise.all(data.data.map(async (msg) => {
                    if (msg.sender_avatar) {
                        msg.sender_avatar = await fetchBlob(process.env.NEXT_PUBLIC_BACK_END_DOMAIN + msg.sender_avatar);
                    } else {
                        msg.sender_avatar = '/default-avatar.jpg';
                    }
                    return msg;
                }));

                const reversedMessages = [...processedMessages].reverse();

                if (pageNum === 0) {
                    setMessages(reversedMessages);
                    setTimeout(() => {
                        if (containerRef.current) {
                            containerRef.current.scrollTop = containerRef.current.scrollHeight;
                        }
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
        if (!groupID) return;

        try {
            await fetch(
                `${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/chat/group/markAsRead/${groupID}`,
                {
                    method: 'PATCH',
                    headers: { 'Authorization': `Bearer ${cookieValue}` },
                }
            );
        } catch (error) {
            console.error('Error marking messages as seen:', error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        const messageContent = message.trim();
        if (!messageContent) return;

        setMessage('');

        const tempMessage = {
            message_id: `temp-${Date.now()}`,
            sender_id: myUserId,
            group_id: groupID,
            content: messageContent,
            seen: false,
            created_at: new Date().toISOString(),
        };

        setMessages(prev => [...prev, tempMessage]);

        sendWebSocketMessage(groupID, messageContent, 'to_group');

        window.dispatchEvent(new CustomEvent('refrech_contacts'));

        setTimeout(() => {
            if (containerRef.current) {
                containerRef.current.scrollTop = containerRef.current.scrollHeight;
            }
        }, 5);
    };

    return (
        <div className="chat-page">
            <div className="chat-page-header group-chat-header">
                <div className="chat-page-contact-info">
                    <div className="group-avatar-icon header-group-icon">
                        G
                    </div>
                    <h2>{group?.Name}</h2>
                </div>
                {group && <div className="group-members-count">{group?.Member_count} members</div>}
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
                {loadingMore && (
                    <div className="loading-more-messages">
                        Loading more messages...
                    </div>
                )}

                {!loading ? (
                    <>
                        {messages.length === 0 ? (
                            <div className="no-messages">
                                <p>No messages yet</p>
                                <p>Start the conversation in {group.Name}!</p>
                            </div>
                        ) : (
                            <>
                                {messages.map((msg) => (
                                    <div key={msg.message_id} className={`message ${msg.sender_id === myUserId ? 'sent' : 'received'}`}>
                                        {msg.sender_id !== myUserId && (
                                            <div className="message-sender-info">
                                                <div className="message-sender-avatar">
                                                    <Image src={msg.sender_avatar} alt={`${msg.sender_first_name}`} width={24} height={24} />
                                                </div>
                                                <span className="message-sender-name">
                                                    {msg.sender_first_name} {msg.sender_last_name}
                                                </span>
                                            </div>
                                        )}
                                        <div className="message-content">{msg.content}</div>
                                        <div className="message-time">{formatTime(msg.created_at)}</div>
                                    </div>
                                ))}
                            </>
                        )}
                    </>
                ) : (
                    <div className="loading-messages">
                        <div className="loading-spinner"></div>
                    </div>
                )}
            </div>

            <form className="chat-page-input-form" onSubmit={handleSendMessage}>
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