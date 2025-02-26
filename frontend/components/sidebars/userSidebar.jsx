"use client"
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { fetchBlob } from '@/lib/fetch_blob';
import { GetCookie } from '@/lib/cookie';
import './sidebar.css';
import ChatDialog from '@/components/chat/chatDialog';

const UserSidebar = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showChatDialog, setShowChatDialog] = useState(false);
  const cookieValue = GetCookie("sessionId");
  const loadMoreRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    fetchContacts(page);
  }, [page]);

  useEffect(() => {
    if (!loadMoreRef.current || !hasMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          setPage(prevPage => prevPage + 1);
        }
      },
      { threshold: 0.1 }
    );

    observerRef.current.observe(loadMoreRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore]);

  const fetchContacts = async (pageNum) => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/chat/contacts?offset=${pageNum}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${cookieValue}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch contacts');

      const data = await response.json();

      if (data.data && data.data.length > 0) {
        const processedContacts = await Promise.all(data.data.map(async contact => {
          contact.avatar = contact.avatar
            ? await fetchBlob(process.env.NEXT_PUBLIC_BACK_END_DOMAIN + contact.avatar)
            : '/default-avatar.jpg';
          return contact;
        }));

        if (pageNum === 0) {
          setContacts(processedContacts);
        } else {
          setContacts(prev => [...prev, ...processedContacts]);
        }

        setHasMore(data.data.length === 20);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContactClick = (contact) => {
    setSelectedUser(contact);
    setShowChatDialog(true);
  };

  const handleCloseDialog = () => {
    setShowChatDialog(false);
    setSelectedUser(null);
  };

  const refreshContacts = () => {
    setPage(0);
    setHasMore(true);
    fetchContacts(0);
  };

  return (
    <>
      <h2 className="contacts-header">Messages</h2>
      {contacts.length === 0 && !loading ? (
        <div className="no-contacts-sidebar">
          <p>No conversations yet</p>
        </div>
      ) : (
        <ul className="contacts-list">
          {contacts.map(contact => (
            <li key={contact.user_id} className={`sidebar-contact-item ${!contact.is_seen ? 'unseen' : ''}`} onClick={() => handleContactClick(contact)}>
              <div className="contact-avatar-wrapper">
                <Image src={contact.avatar} alt={`${contact.first_name} ${contact.last_name}`} width={36} height={36} className="contact-avatar" />
              </div>
              <div className="contact-details">
                <div className="contact-header">
                  <span className="contact-name">{contact.first_name} {contact.last_name}</span>
                  <span className="message-time">{formatTime(contact.last_message_time)}</span>
                </div>
                <p className={`last-message`}>
                  {contact.last_message.length > 30
                    ? `${contact.last_message.substring(0, 30)}...`
                    : contact.last_message
                  }
                </p>
              </div>
            </li>
          ))}

          <li ref={loadMoreRef} className="load-more-item">
            {loading && <div className="sidebar-loading-spinner"></div>}
          </li>
        </ul>
      )}

      {showChatDialog && selectedUser && (
        <ChatDialog contact={selectedUser} onClose={handleCloseDialog} onMessageSent={refreshContacts}/>
      )}
    </>
  );
};

const formatTime = (timestamp) => {
  const messageDate = new Date(timestamp);
  const now = new Date();
  const diffMs = now - messageDate;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  return messageDate.toLocaleDateString();
};

export default UserSidebar;