// app/(main)/groups/[id]/page.js
"use client"
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { FiCalendar, FiUsers, FiPlus } from 'react-icons/fi';
import CreatePost from '@/components/groups/create/createPost';
import CreateEvent from '@/components/groups/create/createEvent';
import GroupHeader from '@/components/groups/groupHeader/groupHeader';
import EventCard from '@/components/groups/cards/eventCard';
import Post from '@/components/posts/post';
import { GetCookie } from '@/lib/cookie';
import './group.css';
import RequestCard from '@/components/groups/cards/requestCard';


const mockGroup = {
    id: 1,
    name: "Tech Enthusiasts",
    description: "A community for technology lovers and innovators. Share your tech insights, discuss latest trends, and connect with fellow enthusiasts.",
    memberCount: 1234,
    isJoined: true,
    admin: "Emma Watson",
    created: "January 2024"
};

const mockEvents = [
    {
        id: 1,
        title: "Tech Meetup 2024",
        description: "Join us for our annual tech meetup!",
        date: "2024-03-25",
        time: "18:00",
        attendees: 45,
        going: true
    },
    {
        id: 2,
        title: "Web Development Workshop",
        description: "Learn the basics of web development",
        date: "2024-04-01",
        time: "14:00",
        attendees: 30,
        going: false
    }
];

const mockPosts = [
    {
        "id": "2",
        "content": "My first post!",
        "created_at": "2025-02-17T11:18:40Z",
        "timestamp": "02/17/2025, 11:18 AM",
        "likes": 0,
        "comments": 0,
        "privacy": "public",
        "user": {
            "name": "Hamza Maach",
            "avatar": "/default-avatar.jpg"
        }
    },
    {
        "id": "1",
        "content": "Hello World!",
        "created_at": "2025-02-17T11:18:40Z",
        "timestamp": "02/17/2025, 11:18 AM",
        "likes": 0,
        "comments": 0,
        "privacy": "public",
        "user": {
            "name": "Hamza Maach",
            "avatar": "/default-avatar.jpg"
        }
    }
]

const GroupDetailPage = () => {
    const [activeTab, setActiveTab] = useState('posts');
    const [showCreateEvent, setShowCreateEvent] = useState(false);
    const [events, setEvents] = useState(mockEvents);
    const [request, setRequest] = useState([]);
    const [groupData, setGroupData] = useState([]);
    const { groupID } = useParams();
    const cookieValue = GetCookie("sessionId")
    console.log(groupID)
    
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

    const handleCreateEvent = (eventData) => {
        const newEvent = {
            id: events.length + 1,
            ...eventData,
            attendees: 0,
            going: false
        };
        setEvents([newEvent, ...events]);
    };

    const handleEventResponse = (eventId, response) => {
        setEvents(events.map(event => {
            if (event.id === eventId) {
                const wasGoing = event.going;
                return {
                    ...event,
                    going: response === 'going',
                    attendees: response === 'going'
                        ? (wasGoing ? event.attendees : event.attendees + 1)
                        : (wasGoing ? event.attendees - 1 : event.attendees)
                };
            }
            return event;
        }));
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
                console.log(groupData)
            }).catch((error) => {
                console.log(error)
            })
    };

    return (
        <div className="group-detail-page">
            <GroupHeader group={groupData}/>
            {console.log(groupData)}
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
                           <CreatePost />
                           {mockPosts.map(post => (
                               <Post key={post.id} post={post} />
                           ))}
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
                               {events.map(event => (
                                   <EventCard key={event.id} event={event} onResponseChange={handleEventResponse} />
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