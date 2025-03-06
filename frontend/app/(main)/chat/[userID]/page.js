'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { FiSend } from 'react-icons/fi';
import { BsEmojiSmile } from 'react-icons/bs';
import { GetCookie } from '@/lib/cookie';
import { useParams } from 'next/navigation';
import { fetchBlob } from '@/lib/fetch_blob';
import { formatTime } from '@/lib/format_time';
import { useWebSocket } from '@/lib/useWebSocket';
import EmojiPicker from '@/components/chat/EmojiPicker';
import './chat.css';

export default function ChatPage() {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [messageIds, setMessageIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [contact, setContact] = useState(null);
    const [myUserId, setMyUserId] = useState(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const containerRef = useRef(null);
    const messageSeenTimeout = useRef(null);
    const inputRef = useRef(null);

    const cookieValue = GetCookie("sessionId");
    const params = useParams();
    const userId = params.userID;

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

        return () => {
            if (messageSeenTimeout.current) {
                clearTimeout(messageSeenTimeout.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId, cookieValue]);

    const handleNewMessage = useCallback((data) => {
        if (data.message.receiver_type !== 'to_user' || data.message.sender_id !== userId) {
            return
        }

        const newMessage = {
            message_id: data.message.id,
            sender_id: data.message.sender_id,
            receiver_id: data.message.receiver_id,
            content: data.message.content,
            seen: false,
            created_at: data.message.created_at || new Date().toISOString()
        };

        if (!messageIds.has(newMessage.message_id)) {
            setMessageIds(prev => new Set([...prev, newMessage.message_id]));
            setMessages(prev => [...prev, newMessage]);

            setTimeout(() => {
                if (containerRef.current) {
                    containerRef.current.scrollTop = containerRef.current.scrollHeight;
                }
            }, 5);
        }

        if (messageSeenTimeout.current) {
            clearTimeout(messageSeenTimeout.current);
        }

        messageSeenTimeout.current = setTimeout(() => {
            markMessagesAsSeen();
        }, 500);
    }, [messageIds, userId]);

    const sendWebSocketMessage = useWebSocket(userId, handleNewMessage, null);

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
                const newMessages = reversedMessages.filter(msg => !messageIds.has(msg.message_id));

                const newMessageIds = new Set(messageIds);
                newMessages.forEach(msg => newMessageIds.add(msg.message_id));
                setMessageIds(newMessageIds);

                if (pageNum === 0) {
                    setMessages(newMessages);
                    setTimeout(() => {
                        containerRef.current.scrollTop = containerRef.current.scrollHeight;
                    }, 4);
                } else {
                    const container = containerRef.current;
                    const scrollHeight = container?.scrollHeight || 0;
                    const scrollTop = container?.scrollTop || 0;

                    setMessages(prevMessages => [...newMessages, ...prevMessages]);
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
        if (!userId) return;

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

    const handleSendMessage = async (e) => {
        e.preventDefault();
        const messageContent = message.trim();
        if (!messageContent) return;

        setMessage('');
        setShowEmojiPicker(false);

        const tempId = `temp-${Date.now()}`;
        const tempMessage = {
            message_id: tempId,
            sender_id: myUserId,
            receiver_id: userId,
            content: messageContent,
            seen: false,
            created_at: new Date().toISOString()
        };

        if (!messageIds.has(tempId)) {
            setMessageIds(prev => new Set([...prev, tempId]));
            setMessages(prev => [...prev, tempMessage]);
        }

        sendWebSocketMessage(userId, messageContent, 'to_user');

        window.dispatchEvent(new CustomEvent('refrech_contacts'));

        setTimeout(() => {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }, 5);
    };

    const handleEmojiSelect = (emoji) => {
        setMessage(prev => prev + emoji);
        if (inputRef.current) {
            inputRef.current.focus();
        }
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
                                <p>Start a conversation with {contact?.first_name}!</p>
                            </div>
                        ) : (
                            <>
                                {messages.map((msg, index) => (
                                    <div key={msg.message_id || index} className={`message ${msg.sender_id === myUserId ? 'sent' : 'received'}`}>
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
                <div className="chat-input-container">
                    <input
                        type="text"
                        ref={inputRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="chat-page-input"
                    />
                    <button
                        type="button"
                        className="emoji-toggle-btn"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    >
                        <BsEmojiSmile />
                    </button>
                    {showEmojiPicker && (
                        <EmojiPicker
                            onSelectEmoji={handleEmojiSelect}
                            onClose={() => setShowEmojiPicker(false)}
                        />
                    )}
                </div>
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