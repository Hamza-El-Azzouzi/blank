/* eslint-disable @next/next/no-img-element */
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
import '../../[userID]/chat.css';
import './group-chat.css';
import Error from '@/components/error/Error';
import Link from 'next/link';

export default function GroupChatPage() {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [messageIds, setMessageIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [group, setGroup] = useState(null);
    const [myUserId, setMyUserId] = useState(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [error, setError] = useState(null);
    const containerRef = useRef(null);
    const messageSeenTimeout = useRef(null);
    const inputRef = useRef(null);

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

                const data = await response.json();


                if (data.status != 200) {
                    setError(data)
                    return;
                }
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

    const handleNewMessage = useCallback(async (data) => {
        if (data.message && (data.message.receiver_type !== 'to_group' || data.message.receiver_id !== groupID)) return;

        if (data.avatar) {
            data.avatar = await fetchBlob(process.env.NEXT_PUBLIC_BACK_END_DOMAIN + data.avatar);
        } else {
            data.avatar = '/default-avatar.jpg';
        }

        const newMessage = {
            message_id: data.message.id,
            sender_id: data.message.sender_id,
            group_id: data.message.receiver_id,
            content: data.message.content,
            seen: false,
            created_at: data.message.created_at || new Date().toISOString(),
            sender_first_name: data.first_name || "User",
            sender_last_name: data.last_name || "",
            sender_avatar: data.avatar
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
    }, [groupID, messageIds]);

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

            const data = await response.json();

            if (data.status != 200) {
                setError(data)
                return;
            }

            if (data.data && data.data.length > 0) {
                const processedMessages = await Promise.all(data.data.map(async (msg) => {
                    if (msg.sender_avatar) {
                        try {
                            msg.sender_avatar = await fetchBlob('http://127.0.0.1:1414/' + msg.sender_avatar);
                        } catch (error) {
                            console.error('Error fetching avatar:', error);
                            msg.sender_avatar = '/default-avatar.jpg';
                        }
                    } else {
                        msg.sender_avatar = '/default-avatar.jpg';
                    }
                    return msg;
                }));
                const reversedMessages = [...processedMessages].reverse();

                const newMessages = reversedMessages.filter(msg => !messageIds.has(msg.message_id));

                const newMessageIds = new Set(messageIds);
                newMessages.forEach(msg => newMessageIds.add(msg.message_id));
                setMessageIds(newMessageIds);

                if (pageNum === 0) {
                    setMessages(newMessages);
                    setTimeout(() => {
                        if (containerRef.current) {
                            containerRef.current.scrollTop = containerRef.current.scrollHeight;
                        }
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
        setShowEmojiPicker(false);

        const tempId = `temp-${Date.now()}`;
        const tempMessage = {
            message_id: tempId,
            sender_id: myUserId,
            group_id: groupID,
            content: messageContent,
            seen: false,
            created_at: new Date().toISOString(),
        };

        if (!messageIds.has(tempId)) {
            setMessageIds(prev => new Set([...prev, tempId]));
            setMessages(prev => [...prev, tempMessage]);
        }

        sendWebSocketMessage(groupID, messageContent, 'to_group');

        window.dispatchEvent(new CustomEvent('refrech_contacts'));

        setTimeout(() => {
            if (containerRef.current) {
                containerRef.current.scrollTop = containerRef.current.scrollHeight;
            }
        }, 5);
    };

    const handleEmojiSelect = (emoji) => {
        setMessage(prev => prev + emoji);
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    if (error) return <Error error={error} />

    return (
        <div className="chat-page">
            <div className="chat-page-header group-chat-header">
                <div className="chat-page-contact-info">
                    <Link href={`/groups/${groupID}`} className="chat-header-link">
                        <div className="group-avatar-icon header-group-icon">
                            G
                        </div>
                        <h2>{group?.Name}</h2>
                    </Link>
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
                                <p>Start the conversation in {group?.Name}!</p>
                            </div>
                        ) : (
                            <>
                                {messages.map((msg) => (
                                    <div key={msg.message_id} className={`message ${msg.sender_id === myUserId ? 'sent' : 'received'}`}>
                                        {msg.sender_id !== myUserId && (
                                            <div className="message-sender-info">
                                                <div className="message-sender-avatar">
                                                    <img src={msg.sender_avatar} alt={`${msg.sender_first_name}`} style={{ width:'24px',height:'24px' }}/>
                                                    {/* <Image src={msg.sender_avatar} alt={`${msg.sender_first_name}`} width={24} height={24} /> */}
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