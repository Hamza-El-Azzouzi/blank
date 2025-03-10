"use client"
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { FiPlus } from 'react-icons/fi';
import CreatePost from '@/components/groups/create/createPost';
import CreateEvent from '@/components/groups/create/createEvent';
import GroupHeader from '@/components/groups/groupHeader/groupHeader';
import EventCard from '@/components/groups/cards/eventCard';
import { GetCookie } from '@/lib/cookie';
import './group.css';
import RequestCard from '@/components/groups/cards/requestCard';
import { fetchBlob } from '@/lib/fetch_blob';
import Posts from '@/components/posts/posts';
import Toast from '@/components/toast/Toast';
import Error from '@/components/error/Error';

const ITEMS_PER_PAGE = 20;

const GroupDetailPage = () => {
    const [toasts, setToasts] = useState([]);

    const [activeTab, setActiveTab] = useState('posts');
    const [showCreateEvent, setShowCreateEvent] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const [isJoined, setIsJoined] = useState(false);

    const [events, setEvents] = useState([]);
    const [eventPage, setEventPage] = useState(0);
    const [loadingEvents, setLoadingEvents] = useState(false);
    const [hasMoreEvents, setHasMoreEvents] = useState(true);

    const [requests, setRequests] = useState([]);
    const [error, setError] = useState(null);

    const [requestPage, setRequestPage] = useState(0);
    const [loadingRequests, setLoadingRequests] = useState(false);
    const [hasMoreRequests, setHasMoreRequests] = useState(true);

    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(0);
    const [endReached, setEndReached] = useState(false);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const observerRef = useRef(null);
    const loadMoreRef = useRef(null);

    const [groupData, setGroupData] = useState([]);
    const { groupID } = useParams();
    const cookieValue = GetCookie("sessionId");
    const handleNewPost = (newPost) => {
        setPosts(prevPosts => [newPost, ...prevPosts]);
    };
    const handleLoadMore = () => {
        if (hasMore && !loading) {
            setPage(prevPage => prevPage + 20);
        }
    };
    const showToast = (type, message) => {
        const newToast = { id: Date.now(), type, message };
        setToasts((prevToasts) => [...prevToasts, newToast]);
    };
    const removeToast = (id) => {
        setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    };
    useEffect(() => {
        const fetchGroupData = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/group/${groupID}`, {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        'content-type': 'application/json',
                        'Authorization': `Bearer ${cookieValue}`
                    },
                });

                const data = await response.json();

                if (data.status != 200) {
                    setError(data)
                    return;
                }

                setGroupData(data.data)
                setIsJoined(data.data.IsJoined);
                setIsOwner(data.data.IsOwner);

            } catch (error) {
                showToast('error', "An Error Occure, Try Later!!");

            }
        };
        fetchGroupData();


    }, [cookieValue, groupID, groupData.isJoined]);
    useEffect(() => {
        if ((isJoined || isOwner) && !endReached) {
            fetchPosts(groupID, page);
        }
    }, [endReached, groupID, isJoined, isOwner, page]);

    useEffect(() => {
        if (activeTab !== 'events' || loadingEvents || !hasMoreEvents) return;

        const fetchEvents = async () => {
            setLoadingEvents(true);
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/group/${groupID}/event/${eventPage}`, {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        'content-type': 'application/json',
                        'Authorization': `Bearer ${cookieValue}`
                    },
                });
                if (!response.ok) throw new Error("Failed to fetch events");

                const data = await response.json();

                if (data.data && data.data[0].TotalCount < ITEMS_PER_PAGE) {
                    setHasMoreEvents(false);
                }
                if (data.data) setEvents(prevEvents => [...prevEvents, ...data.data]);
            } catch (error) {
                showToast('error', "An Error Occure, Try Later!!");
            } finally {
                setLoadingEvents(false);
            }
        };

        fetchEvents();
    }, [eventPage, activeTab]);

    useEffect(() => {
        if (activeTab !== 'request' || loadingRequests || !hasMoreRequests) return;

        const fetchRequests = async () => {
            setLoadingRequests(true);
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/group/${groupID}/request/${requestPage}`, {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        'content-type': 'application/json',
                        'Authorization': `Bearer ${cookieValue}`
                    },
                });
                if (!response.ok) throw new Error("Failed to fetch requests");

                const data = await response.json();

                if (data.data && data.data[0].TotalCount < ITEMS_PER_PAGE) {
                    setHasMoreRequests(false);
                }

                if (data.data) setRequests(prevRequests => [...prevRequests, ...data.data]);

            } catch (error) {
                showToast('error', "An Error Occure, Try Later!!");
            } finally {
                setLoadingRequests(false);
            }
        };

        fetchRequests();
    }, [requestPage, activeTab]);

    useEffect(() => {
        if (!loadMoreRef.current) return;

        observerRef.current = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    if (activeTab === 'events' && hasMoreEvents && !loadingEvents) {
                        setEventPage(prevPage => prevPage + 1);
                    }
                    if (activeTab === 'request' && hasMoreRequests && !loadingRequests) {
                        setRequestPage(prevPage => prevPage + 1);
                    }
                }
            },
            { threshold: 1.0 }
        );

        observerRef.current.observe(loadMoreRef.current);

        return () => {
            if (observerRef.current) observerRef.current.disconnect();
        };
    }, [loadingEvents, loadingRequests, hasMoreEvents, hasMoreRequests, activeTab]);

    const handleEventResponse = (eventId, response) => {
        fetch(`${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/group/${groupID}/event/response`, {
            method: "POST",
            credentials: "include",
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${cookieValue}`
            },
            body: JSON.stringify({ event_id: eventId, response })
        })
            .then(response => {

                if (!response.ok) {
                    return response.json().then(error => { throw error; });
                }
                return response.json();
            })
            .then((data) => {
                setEvents(prevEvents =>
                    prevEvents.map(prevEvent => {
                        if (prevEvent.event_id === eventId) {
                            return {
                                ...prevEvent,
                                going_count: data.data.going_count,
                                is_going: data.data.is_going
                            };
                        }
                        return prevEvent;
                    })
                );
                showToast('success', 'Success! Operation completed.');
            }).catch((error) => {
                showToast('error', "An Error Occure, Try Later!!");
            })
    };
    const handleRequesttResponse = (requestId, response, userId) => {
        fetch(`${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/group/${requestId}/response`, {
            method: "POST",
            credentials: "include",
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${cookieValue}`
            },
            body: JSON.stringify({ user_id: userId, response })
        })
            .then(response => {

                if (!response.ok) {
                    return response.json().then(error => { throw error; });
                }
                return response.json();
            })
            .then((data) => {
                setGroupData(prevData => ({
                    ...prevData,
                    Member_count: data.data
                }));

                setRequests(prevRequests =>
                    prevRequests.filter(req => req.UserId !== userId)
                );
                showToast('success', 'Success! Operation completed.');
            }).catch((error) => {
                showToast('error', "An Error Occure, Try Later!!");
            })
    };
    const fetchPosts = async (group_id, pageNumber) => {
        if (endReached || (!isJoined && !isOwner)) return;
        try {
            setLoading(true);
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/group/${group_id}/post/${pageNumber}`, {
                method: 'GET',
                headers: {
                    'content-type': 'application/json',
                    'Authorization': `Bearer ${cookieValue}`,
                },
            });
            if (!response.ok) throw new Error('Failed to fetch posts', response);
            const data = await response.json();
            if (data.data && data.data.length > 0) {
                const newPosts = await Promise.all(data.data.map(async (post) => {
                    post.avatar = post.avatar
                        ? await fetchBlob(process.env.NEXT_PUBLIC_BACK_END_DOMAIN + post.avatar)
                        : '/default-avatar.jpg';
                    if (post.image) {
                        post.image = await fetchBlob(process.env.NEXT_PUBLIC_BACK_END_DOMAIN + post.image);
                    }
                    post.author = `${post.first_name} ${post.last_name}`
                    return post;
                }));

                if (pageNumber === 0) {
                    setPosts(newPosts);
                } else {
                    setPosts(prevPosts => {
                        const seen = new Set(prevPosts.map(p => p.post_id));
                        const filteredNewPosts = newPosts.filter(post => !seen.has(post.post_id));
                        return [...prevPosts, ...filteredNewPosts];
                    });
                }
                setHasMore(newPosts.length === 20);
            } else {
                setHasMore(false);
                setEndReached(true);
            }
        } catch (error) {
            showToast('error', "An Error Occure, Try Later!!");
        } finally {
            setLoading(false);
        }
    };


    const handleCreateEvent = (eventData) => {
        eventData["group_id"] = groupID
        fetch(`${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/group/createEvent`, {
            method: "POST",
            credentials: "include",
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${cookieValue}`
            },
            body: JSON.stringify(eventData)
        })
            .then(response => {

                if (!response.ok) {
                    return response.json().then(error => { throw error; });
                }
                return response.json();
            })
            .then((data) => {
                const newEvent = {
                    ...data.data,
                    going_count: 0,
                    is_going: false
                };
                setEvents(prevEvents => [newEvent, ...(prevEvents || [])]);
            }).catch((error) => {
                showToast('error', "An Error Occure, Try Later!!");
            })
    };

    if (error) return <Error error={error} />

    return (
        <div className="group-detail-page">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
            <GroupHeader
                group={groupData}
                onJoinStateChange={(newJoinState) => {
                    setGroupData(prev => ({
                        ...prev,
                        IsJoined: newJoinState
                    }));
                    setIsJoined(newJoinState);
                }}
            />
            {(groupData.IsJoined || groupData.IsOwner) && (
                <div className="group-content">
                    <div className="group-tabs">
                        <button className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`} onClick={() => setActiveTab('posts')}>
                            Posts
                        </button>
                        <button className={`tab-btn ${activeTab === 'events' ? 'active' : ''}`} onClick={() => setActiveTab('events')}>
                            Events
                        </button>
                        {groupData.IsOwner && (
                            <button className={`tab-btn ${activeTab === 'request' ? 'active' : ''}`} onClick={() => setActiveTab('request')}>
                                Requests
                            </button>
                        )}
                    </div>
                    {activeTab === 'posts' && (
                        <div className="posts-section">
                            <CreatePost onPostCreated={handleNewPost} groupID={groupID} />
                            <Posts
                                posts={posts}
                                loading={loading}
                                endReached={endReached}
                                onLoadMore={handleLoadMore}
                                target="Group_Post"
                            />
                        </div>
                    )}
                    {activeTab === 'events' && (
                        <div>
                            <div className="events-header">
                                <h2>Upcoming Events</h2>
                                <button className="create-event-btn" onClick={() => setShowCreateEvent(true)}>
                                    <FiPlus /> Create Event
                                </button>
                            </div>
                            <div className="events-list">
                                {events.map(event => (
                                    <EventCard key={event.event_id} event={event} onResponseChange={handleEventResponse} />
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'request' && groupData.IsOwner && (
                        <div>
                            <div className="events-header">
                                <h2>Requests</h2>
                            </div>
                            <div className="events-list">
                                {requests.map(req => (
                                    <RequestCard key={req.UserId} request={req} onResponseChange={handleRequesttResponse} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Infinite scrolling trigger (works only on Events or Requests tab) */}
            {loadingEvents || loadingRequests && (
                <div ref={loadMoreRef} style={{ height: '1px' }}></div>
            )}

            {showCreateEvent && (
                <CreateEvent onClose={() => setShowCreateEvent(false)} onSubmit={handleCreateEvent} />
            )}
        </div>
    );
};

export default GroupDetailPage;
