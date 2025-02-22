// app/(main)/groups/[id]/page.js
"use client"
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { FiCalendar, FiUsers, FiPlus } from 'react-icons/fi';
import CreatePost from '@/components/groups/create/createPost';
import CreateEvent from '@/components/groups/create/createEvent';
import GroupHeader from '@/components/groups/groupHeader/groupHeader';
import EventCard from '@/components/groups/cards/eventCard';
import { GetCookie } from '@/lib/cookie';
import './group.css';
import RequestCard from '@/components/groups/cards/requestCard';
import { fetchBlob } from '@/lib/fetch_blob';
import Posts from '@/components/posts/posts';

const GroupDetailPage = () => {
    const [activeTab, setActiveTab] = useState('posts');
    const [showCreateEvent, setShowCreateEvent] = useState(false);
    const [events, setEvents] = useState([]);
    const [request, setRequest] = useState([]);
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(0);
    const [endReached, setEndReached] = useState(false);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const handleNewPost = (newPost) => {
        setPosts(prevPosts => [newPost, ...prevPosts]);
    };
    const handleLoadMore = () => {
        if (hasMore && !loading) {
            setPage(prevPage => prevPage + 20);
        }
    };
    const [groupData, setGroupData] = useState([]);
    const { groupID } = useParams();
    const cookieValue = GetCookie("sessionId")

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                //api/group/{group_id}/event
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/group/${groupID}/event`, {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        'content-type': 'application/json',
                        'Authorization': `Bearer ${cookieValue}`
                    },
                });
                if (!response.ok) {
                    const error = await response.json();
                    throw error;
                }
                const data = await response.json();
                console.log(data.data)
                setEvents(data.data);
            } catch (error) {
                console.log(error);
            }
        };
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
                if (!response.ok) {
                    const error = await response.json();
                    throw error;
                }
                const data = await response.json();
                setGroupData(data.data);
            } catch (error) {
                console.log(error);
            }
        };
        fetchGroupData();
        fetchEvent();
    }, [cookieValue, groupID]);
    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/group/${groupID}/request`, {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        'content-type': 'application/json',
                        'Authorization': `Bearer ${cookieValue}`
                    },
                });
                if (!response.ok) {
                    const error = await response.json();
                    throw error;
                }
                const data = await response.json();
                setRequest(data.data);
            } catch (error) {
                console.log(error);
            }
        };
        fetchRequests();
    }, [cookieValue, groupID]);
    // api/group/event/
    useEffect(() => {

    }, [cookieValue, groupID]);
    const fetchPosts = async (group_id, pageNumber) => {
        if (endReached) return;

        try {
            setLoading(true);
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_DOMAIN}api/group/${group_id}/post/${pageNumber}`, {
                method: 'GET',
                headers: {
                    'content-type': 'application/json',
                    'Authorization': `Bearer ${cookieValue}`,
                },
            });
            if (!response.ok) throw new Error('Failed to fetch posts');
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
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchPosts(groupID, page)
    }, [page])
    const handleCreateEvent = (eventData) => {
        eventData["group_id"] = groupID
        // api/group/createEvent
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
                setEvents([newEvent, ...events]);
            }).catch((error) => {
                console.log(error)
            })


    };

    const handleEventResponse = (eventId, response) => {
        //api/group/{group_id}/event/response
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
            
            }).catch((error) => {
                console.log(error)
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
                    Member_count: data.data // Accessing the member count from the nested data property
                }));

                // Remove the handled request from the requests list
                setRequest(prevRequests =>
                    prevRequests.filter(req => req.UserId !== userId)
                );
            }).catch((error) => {
                console.log(error)
            })
    };

    return (
        <div className="group-detail-page">
            <GroupHeader group={groupData} />
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
                                Request
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
                            />
                        </div>
                    )}

                    {activeTab === 'events' && (
                        <div>
                            <div className="events-header">
                                <h2>Upcoming Events</h2>
                                <button className="create-event-btn" onClick={() => setShowCreateEvent(true)} >
                                    <FiPlus /> Create Event
                                </button>
                            </div>
                            <div className="events-list">
                                {events && events.length > 0 && events.map(event => (
                                    // console.log(event)
                                    <EventCard key={event.event_id} event={event} onResponseChange={handleEventResponse} />
                                ))}
                            </div>
                        </div>
                    )}
                    {activeTab === 'request' && groupData.IsOwner && (
                        <div>
                            <div className="events-header">
                                <h2>Request</h2>
                            </div>
                            <div className="events-list">
                                {request && request.map(re => (

                                    <RequestCard key={re.UserId} request={re} onResponseChange={handleRequesttResponse} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}


            {showCreateEvent && (
                <CreateEvent onClose={() => setShowCreateEvent(false)} onSubmit={handleCreateEvent} />
            )}
        </div>
    );
};

export default GroupDetailPage;