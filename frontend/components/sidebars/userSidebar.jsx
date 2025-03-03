"use client"
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { fetchBlob } from '@/lib/fetch_blob';
import { GetCookie } from '@/lib/cookie';
import './sidebar.css';
import { formatTime } from '@/lib/format_time';
import { usePathname } from 'next/navigation';
import { useWebSocket } from '@/lib/useWebSocket';

const UserSidebar = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const cookieValue = GetCookie("sessionId");
  const loadMoreRef = useRef(null);
  const observerRef = useRef(null);
  const pathname = usePathname();

  const currentChatUserId = pathname.startsWith('/chat/')
    ? pathname.split('/').pop()
    : null;

  useEffect(() => {
    const handleMessageSent = () => {
      fetchContacts(0);
    };

    window.addEventListener('refrech_contacts', handleMessageSent);

    return () => {
      window.removeEventListener('refrech_contacts', handleMessageSent);
    };
  }, []);

  const handleNewMessage = useCallback(() => {
    fetchContacts(0);
  }, []);

  useWebSocket(null, handleNewMessage, null);

  useEffect(() => {
    fetchContacts(page);
  }, [page]);

  useEffect(() => {
    if (currentChatUserId) {
      setContacts(prevContacts => {
        return prevContacts.map(contact => {
          if (contact.user_id === currentChatUserId) {
            return { ...contact, is_seen: true };
          }
          return contact;
        });
      });
    }
  }, [currentChatUserId]);

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

          if (currentChatUserId && contact.user_id === currentChatUserId) {
            contact.is_seen = true;
          }
          return contact;
        }));

        if (pageNum === 0) {
          setContacts(processedContacts);
        } else {
          setContacts(prev => {
            const uniqueContacts = [...prev];

            processedContacts.forEach(newContact => {
              if (!uniqueContacts.some(c => c.user_id === newContact.user_id)) {
                uniqueContacts.push(newContact);
              }
            });
            return uniqueContacts;
          });
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
            <li key={contact.user_id}>
              <Link href={`/chat/${contact.user_id}`} className={`sidebar-contact-item ${!contact.is_seen ? 'unseen' : ''}`}>
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
              </Link>
            </li>
          ))}

          <li ref={loadMoreRef} className="load-more-item">
            {loading && <div className="sidebar-loading-spinner"></div>}
          </li>
        </ul>
      )}
    </>
  );
};

export default UserSidebar;