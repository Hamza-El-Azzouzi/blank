// components/groups/eventCard.jsx
"use client"
import React from 'react';
import { FiCalendar, FiUsers } from 'react-icons/fi';
import './eventCard.css';

const EventCard = ({ event, onResponseChange }) => {
    const handleResponse = (response) => {
        onResponseChange(event.id, response);
    };

    return (
        <div className="event-card">
            <div className="event-info">
                <h3>{event.title}</h3>
                <p>{event.description}</p>
                <div className="event-meta">
                    <span className="event-date">
                        <FiCalendar /> {event.date} at {event.time}
                    </span>
                    <span className="event-attendees">
                        <FiUsers /> {event.attendees} attending
                    </span>
                </div>
            </div>
            <div className="event-response-buttons">
                <button
                    className={`response-button ${event.going ? 'going' : ''}`}
                    onClick={() => handleResponse('going')}
                >
                    Going
                </button>
                <button
                    className={`response-button ${event.going === false ? 'not-going' : ''}`}
                    onClick={() => handleResponse('not-going')}
                >
                    Not Going
                </button>
            </div>
        </div>
    );
};

export default EventCard;