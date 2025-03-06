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
  const [groupChats, setGroupChats] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [activeChatType, setActiveChatType] = useState('direct');
  const [groupPage, setGroupPage] = useState(0);
  const [hasMoreGroups, setHasMoreGroups] = useState(false);
  const cookieValue = GetCookie("sessionId");
  const loadMoreRef = useRef(null);
  const observerRef = useRef(null);
  const loadMoreGroupsRef = useRef(null);
  const groupObserverRef = useRef(null);
  const pathname = usePathname();

  const handleNewMessage = useCallback((data) => {
    if (data.message.receiver_type === 'to_user') {
      fetchContacts(0);
    } else {
      fetchGroupChats(0);
    }
  }, [pathname]);
  useWebSocket(null, handleNewMessage, null);

  useEffect(() => {
    if (activeChatType === 'direct') {
      fetchContacts(0)
    } else {
      fetchGroupChats(0)
    }
  }, [activeChatType])

  useEffect(() => {
    const handleMessageSent = () => {
      if (activeChatType === 'direct') {
        fetchContacts(0);
      } else {
        fetchGroupChats(0);
      }
    };

    window.addEventListener('refrech_contacts', handleMessageSent);

    return () => {
      window.removeEventListener('refrech_contacts', handleMessageSent);
    };
  }, [activeChatType]);

  useEffect(() => {
    if (activeChatType === 'direct') {
      fetchContacts(page);
    } else {
      fetchGroupChats(groupPage);
    }
  }, [page, groupPage]);

  useEffect(() => {
    if (!loadMoreRef.current || !hasMore || activeChatType !== 'direct') return;

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
  }, [hasMore, loading, activeChatType]);

  useEffect(() => {
    if (!loadMoreGroupsRef.current || !hasMoreGroups || activeChatType !== 'group') return;

    groupObserverRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingGroups && hasMoreGroups) {
          setGroupPage(prevPage => prevPage + 1);
        }
      },
      { threshold: 0.1 }
    );

    groupObserverRef.current.observe(loadMoreGroupsRef.current);

    return () => {
      if (groupObserverRef.current) {
        groupObserverRef.current.disconnect();
      }
    };
  }, [hasMoreGroups, loadingGroups, activeChatType]);

  const fetchContacts = async (pageNum) => {
    const currentChatUserId = pathname.startsWith('/chat/') && !pathname.startsWith('/chat/group/')
      ? pathname.split('/').pop()
      : null;

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

  const fetchGroupChats = async (pageNum) => {
    const currentChatGroupId = pathname.startsWith('/chat/group/')
      ? pathname.split('/').pop()
      : null;

    try {
      setLoadingGroups(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/chat/groups?offset=${pageNum}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${cookieValue}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch group chats');

      const data = await response.json();
      data.data.map((group) => {
        console.log(group);
        
        if (group.group_id === currentChatGroupId) {
          group.is_seen = true
        }
      })

      if (data.data && data.data.length > 0) {
        if (pageNum === 0) {
          setGroupChats(data.data);
        } else {
          setGroupChats(prev => {
            const uniqueGroups = [...prev];

            data.data.forEach(newGroup => {
              if (!uniqueGroups.some(g => g.group_id === newGroup.group_id)) {
                uniqueGroups.push(newGroup);
              }
            });
            return uniqueGroups;
          });
        }

        setHasMoreGroups(data.data.length === 20);
      } else {
        setHasMoreGroups(false);
      }
    } catch (error) {
      console.error('Error fetching group chats:', error);
    } finally {
      setLoadingGroups(false);
    }
  };

  return (
    <>
      <div className="contacts-tabs">
        <button
          className={`contacts-tab ${activeChatType === 'direct' ? 'active' : ''}`}
          onClick={() => setActiveChatType('direct')}
        >
          Direct Messages
        </button>
        <button
          className={`contacts-tab ${activeChatType === 'group' ? 'active' : ''}`}
          onClick={() => setActiveChatType('group')}
        >
          Group Chats
        </button>
      </div>

      {activeChatType === 'direct' ? (
        <>
          {contacts.length === 0 && !loading ? (
            <div className="no-contacts-sidebar">
              <p>No conversations yet</p>
            </div>
          ) : (
            <ul className="contacts-list">
              {contacts.map(contact => (
                <li key={contact.user_id}>
                  <Link href={`/chat/${contact.user_id}`} className={`sidebar-contact-item ${contact.is_seen ? '' : 'unseen'}`}>
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
      ) : (
        <>
          {groupChats.length === 0 && !loadingGroups ? (
            <div className="no-contacts-sidebar">
              <p>No group chats yet</p>
            </div>
          ) : (
            <ul className="contacts-list">
              {groupChats.map(group => (
                <li key={group.group_id}>
                  <Link href={`/chat/group/${group.group_id}`} className={`sidebar-contact-item ${!group.is_seen ? 'unseen' : ''}`}>
                    <div className="contact-avatar-wrapper group-avatar">
                      <div className="group-avatar-icon">G</div>
                    </div>
                    <div className="contact-details">
                      <div className="contact-header">
                        <span className="contact-name">{group.group_name}</span>
                        {group.last_message_time && group.last_message_time != "0001-01-01T00:00:00Z" && (
                          <span className="message-time">{formatTime(group.last_message_time)}</span>
                        )}
                      </div>
                      {group.last_message && (
                        <p className={`last-message`}>
                          <span className="group-sender">{group.sender_last_name}: </span>
                          {group.last_message.length > 25
                            ? `${group.last_message.substring(0, 25)}...`
                            : group.last_message
                          }
                        </p>
                      )}
                    </div>
                  </Link>
                </li>
              ))}

              <li ref={loadMoreGroupsRef} className="load-more-item">
                {loadingGroups && <div className="sidebar-loading-spinner"></div>}
              </li>
            </ul>
          )}
        </>
      )}
    </>
  );
};

export default UserSidebar;