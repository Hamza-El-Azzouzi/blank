"use client"
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { FiX, FiSend } from 'react-icons/fi';
import { GetCookie } from '@/lib/cookie';
import './chatDialog.css';
import { formatTime } from '@/lib/format_time';

const ChatDialog = ({ contact, onClose, onMessageSent }) => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const cookieValue = GetCookie("sessionId");
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchMessages();
        markMessagesAsSeen();
    }, []);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/chat/${contact.user_id}`,
                {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${cookieValue}` },
                }
            );

            if (!response.ok) throw new Error('Failed to fetch messages');

            const data = await response.json();
            if (data.data) {
                setMessages(data.data);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const markMessagesAsSeen = async () => {
        try {
            await fetch(
                `${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/chat/markAsRead/${contact.user_id}`,
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
            receiver_id: contact.user_id,
            content: message,
            created_at: Date.now()
        }]);

        setMessage('');
        if (onMessageSent) onMessageSent();
    };

    return (
        <div className="chat-dialog-overlay" onClick={onClose}>
            <div className="chat-dialog" onClick={e => e.stopPropagation()}>
                <div className="chat-dialog-header">
                    <div className="chat-contact-info">
                        <Image src={contact.avatar} alt={`${contact.first_name} ${contact.last_name}`} width={40} height={40} className="chat-contact-avatar" />
                        <h3>{contact.first_name} {contact.last_name}</h3>
                    </div>
                    <button className="close-dialog-btn" onClick={onClose}>
                        <FiX />
                    </button>
                </div>

                <div className="chat-messages">
                    {loading ? (
                        <div className="chat-loading">Loading messages...</div>
                    ) : messages.length === 0 ? (
                        <div className="no-messages">
                            <p>No messages yet</p>
                            <p>Start a conversation with {contact.first_name}!</p>
                        </div>
                    ) : (
                        <>
                            {messages.map((msg, index) => (
                                <div key={index} className={`message ${msg.receiver_id === contact.user_id ? 'sent' : 'received'}`}>
                                    <div className="message-content">{msg.content}</div>
                                    <div className="message-time">{formatTime(msg.created_at)}</div>
                                </div>
                            ))}
                        </>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form className="chat-input-form" onSubmit={sendMessage}>
                    <input type="text" value={message} onChange={e => setMessage(e.target.value)} placeholder="Type a message..." className="chat-input" />
                    <button type="submit" className="send-message-btn" disabled={!message.trim()}>
                        <FiSend />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatDialog;